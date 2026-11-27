import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Switch, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { useEffect, useState } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { CuratorNames } from 'src/components/CuratorBy';
import { DynamicCard } from 'src/components/DynamicCard';
import { DescriptionItem } from 'src/components/DynamicCard/DescriptionItem';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { SelectTargetModal } from 'src/components/SelectTargetModal';
import { TokenAmountInput } from 'src/components/TokenAmountInput';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { FlashLoanUnavailableError, useMigration } from '../../../hooks/useMigration';
import {
  MigrationOpportunity,
  MigrationPreview,
  useMigrationEarnPreview,
} from '../../../hooks/useMigrationApi';
import { useSignsWithOwnKey } from '../../../hooks/useSignsWithOwnKey';
import {
  collateralExposureRow,
  HUB_PICKER,
  hubTitle,
  marketTitle,
  MIGRATE_AMOUNT,
  MIGRATE_FLOW,
  MIGRATION_TX_BUTTONS,
  MIGRATION_TX_ROWS,
  PREVIEW_ROWS,
  PREVIEW_TITLES,
  SPONSORED_BY_AAVE,
} from '../../../utils/copy';
import { change, pct, usd } from '../../../utils/previewCells';
import {
  getMigrationMarketData,
  getMigrationMarketTitle,
} from '../../../V4MigrationPage/utils/markets';
import { getAssetIconSymbol, getHubDisplayName } from '../../../V4MigrationPage/utils/positions';
import { V4MigrationPreview, V4MigrationPreviewRow } from '../../../V4MigrationPreview';
import { PositionName } from '../../../V4MigrationPreview/components/PositionName';
import { V3CollateralExposure } from '../../../V4MigrationPreview/components/V3CollateralExposure';
import { EarnHub } from '../../utils/hubs';
import { EarnMigrationStatus } from '../EarnMigrationStatus';

type Supply = MigrationOpportunity['supplies'][number];

const STACK_SX = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const BUTTON_ROW_SX = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } as const;

const PREVIEW_DEBOUNCE_MS = 400;

const MAX_EXPOSURE_ASSETS = 4;

const previewRows = ({
  opportunity,
  hub,
  preview,
  loading,
  useAsCollateral,
  onChangeHub,
}: {
  opportunity: MigrationOpportunity;
  hub: EarnHub;
  preview?: MigrationPreview;
  loading: boolean;
  useAsCollateral: boolean;
  onChangeHub?: () => void;
}): V4MigrationPreviewRow[] => {
  const source = preview?.source;
  const target = preview?.target;
  const curators = (target?.hubs ?? [])
    .map((targetHub) => targetHub.externalCurator)
    .filter((curator): curator is NonNullable<typeof curator> => !!curator)
    .map(({ name, icon }) => ({ name, icon }));
  const apy = target?.apy?.after?.value;
  const earnings = target?.yearlyEarningsUsd?.after;
  const v3Market = getMigrationMarketData(opportunity.market);
  const exposure = hub.reserve?.exposure ?? [];

  return [
    {
      id: 'market',
      ...PREVIEW_ROWS.market,
      v3: marketTitle(getMigrationMarketTitle(opportunity.market)),
      v4: <PositionName hubName={hub.name} onClick={onChangeHub} />,
    },
    {
      id: 'curator',
      ...PREVIEW_ROWS.curator,
      v4: curators.length ? <CuratorNames curators={curators} /> : undefined,
      loading,
    },
    {
      // As collateral the supply joins the user's position on the spoke, and the API then reports
      // that whole position's APY rather than the deposit's own.
      id: 'apy',
      ...(useAsCollateral ? PREVIEW_ROWS.positionApy : PREVIEW_ROWS.earnApy),
      v3: change(
        source && {
          current: source.current.apy?.value ?? null,
          after: source.after.apy?.value ?? null,
        },
        'percent'
      ),
      v4: apy === undefined || apy === null ? undefined : pct(Number(apy)),
      loading,
    },
    {
      id: 'earnings',
      ...PREVIEW_ROWS.earnEarnings,
      v3: change(
        source && {
          current: source.current.yearlyEarningsUsd,
          after: source.after.yearlyEarningsUsd,
        },
        'usd'
      ),
      v4: earnings === undefined || earnings === null ? undefined : usd(Number(earnings)),
      loading,
    },
    ...(useAsCollateral
      ? [
          {
            id: 'collateralValue',
            ...PREVIEW_ROWS.collateralValue,
            v4: change(target?.collateralUsd ?? undefined, 'usd'),
            loading,
          },
          {
            id: 'borrowingPower',
            ...PREVIEW_ROWS.borrowingPower,
            v4: change(target?.borrowingPowerUsd ?? undefined, 'usd'),
            loading,
          },
          {
            id: 'healthFactor',
            ...PREVIEW_ROWS.healthFactor,
            v4: change(target?.healthFactor ?? undefined, 'number'),
            loading,
          },
        ]
      : []),
    {
      // Neither migration query says which assets share risk: the V3 side is read from the market's
      // own reserves, the V4 side from the V4 API.
      id: 'exposure',
      ...collateralExposureRow(getHubDisplayName(hub.name)),
      v3: v3Market ? (
        <V3CollateralExposure market={v3Market} max={MAX_EXPOSURE_ASSETS} />
      ) : undefined,
      v4: exposure.length ? (
        <AssetGroup
          symbols={exposure.map(getAssetIconSymbol)}
          max={MAX_EXPOSURE_ASSETS}
          size={20}
        />
      ) : undefined,
    },
  ];
};

/** Identifies one preview request, so a confirmation is never applied to a different one. */
const previewKey = (hubId: string, amount: string, useAsCollateral: boolean) =>
  `${hubId}:${amount}:${useAsCollateral}`;

interface PreviewProps {
  opportunity: MigrationOpportunity;
  hub: EarnHub;
  useAsCollateral: boolean;
  /** Opens the list of hubs. Missing when there is no other hub to move to. */
  onChangeHub?: () => void;
}

const Preview = ({
  opportunity,
  hub,
  useAsCollateral,
  onChangeHub,
  preview,
  loading = false,
}: PreviewProps & { preview?: MigrationPreview; loading?: boolean }) => (
  <V4MigrationPreview
    title={PREVIEW_TITLES.earn}
    rows={previewRows({ opportunity, hub, preview, loading, useAsCollateral, onChangeHub })}
  />
);

/** The preview on live data. Only mounted with an amount to move, as the hook cannot be paused. */
const LivePreview = ({
  opportunity,
  hub,
  useAsCollateral,
  onChangeHub,
  user,
  supply,
  amount,
  onPreviewed,
}: PreviewProps & {
  user: string;
  supply: Supply;
  amount: string;
  /** Called once the API confirms this amount, with this collateral setting, can be migrated. */
  onPreviewed: (key: string) => void;
}) => {
  const { data, loading, error } = useMigrationEarnPreview({
    user: user,
    market: {
      address: opportunity.market.address,
      chainId: opportunity.market.chain.chainId,
    },
    currency: supply.currency.address,
    spoke: hub.id,
    amount: amount,
    useAsCollateral,
  });

  // The hook returns no data while it loads, so data here is always for the current request.
  const previewed = data?.target.status === 'PREVIEWED';
  useEffect(() => {
    if (previewed) onPreviewed(previewKey(hub.id, amount, useAsCollateral));
  }, [previewed, hub.id, amount, useAsCollateral, onPreviewed]);

  if (error) {
    return (
      <EmptyStatePaper
        title={<Trans>Something went wrong</Trans>}
        description={<Trans>We couldn&apos;t load the preview. Please try again later.</Trans>}
      />
    );
  }

  if (data && data.target.status !== 'PREVIEWED') {
    return (
      <EmptyStatePaper
        title={<Trans>This migration isn&apos;t available</Trans>}
        description={
          <Trans>The hub can&apos;t take this amount right now. Try another amount or hub.</Trans>
        }
      />
    );
  }

  return (
    <Preview
      opportunity={opportunity}
      hub={hub}
      useAsCollateral={useAsCollateral}
      onChangeHub={onChangeHub}
      preview={data}
      loading={loading}
    />
  );
};

interface ReviewEarnMigrationProps {
  user: string;
  opportunity: MigrationOpportunity;
  supply: Supply;
  hub: EarnHub;
  /** Every hub the position's asset is listed on, the picked one included. */
  hubs: EarnHub[];
  onChangeHub: (hub: EarnHub) => void;
}

/** Second step of the earn flow: how much to move to the picked hub, and what that changes. */
export const ReviewEarnMigration = ({
  user,
  opportunity,
  supply,
  hub,
  hubs,
  onChangeHub,
}: ReviewEarnMigrationProps) => {
  const { currency } = supply;
  const available = new BigNumber(supply.amount.amount.value);
  const [amount, setAmount] = useState<BigNumber | null>(available);
  const debouncedAmount = useDebouncedValue(amount, PREVIEW_DEBOUNCE_MS);
  const { readOnlyMode } = useWeb3Context();
  const { run, migrate, reset } = useMigration();
  const [wantsCollateral, setWantsCollateral] = useState(false);
  // The choice is kept across hubs, and only applies on one that takes the asset as collateral.
  const useAsCollateral = wantsCollateral && hub.canUseAsCollateral;
  const [hubPickerOpen, setHubPickerOpen] = useState(false);
  // Permits authorise the move, and a contract wallet cannot sign them.
  const contractWallet = useSignsWithOwnKey(user, opportunity.market.chain.chainId).data === false;

  const toRequestAmount = (value: BigNumber | null) =>
    value && value.gt(0) && value.lte(available)
      ? value.decimalPlaces(currency.decimals, BigNumber.ROUND_DOWN).toFixed()
      : undefined;
  const previewAmount = toRequestAmount(debouncedAmount);
  const migrateAmount = toRequestAmount(amount);
  const iconSymbol = getAssetIconSymbol(currency);

  const signing = run.status === 'signing';
  // Migrate stays off until the preview confirms exactly what is about to be sent.
  const [previewedKey, setPreviewedKey] = useState<string>();
  const canMigrate =
    !!migrateAmount && previewedKey === previewKey(hub.id, migrateAmount, useAsCollateral);

  if (run.status !== 'idle' && run.status !== 'signing' && migrateAmount) {
    return (
      <EarnMigrationStatus
        status={run.status}
        chainId={opportunity.market.chain.chainId}
        user={user}
        spokeAddress={hub.id}
        txHash={run.txHash}
        receipt={run.receipt}
        symbol={currency.symbol}
        iconSymbol={iconSymbol}
        amount={migrateAmount}
        amountUSD={Number(migrateAmount) * Number(supply.amount.usdPerToken)}
        hubName={hub.name}
        apy={hub.apy}
        onRetry={reset}
      />
    );
  }

  const hubOptions = hubs.map((item) => ({
    id: item.id,
    kind: 'hub' as const,
    name: hubTitle(getHubDisplayName(item.name)),
    apy: item.apy,
    disabled: item.unavailable,
    hub: item,
  }));
  const openHubPicker = hubs.length > 1 && !signing ? () => setHubPickerOpen(true) : undefined;

  return (
    <Box sx={STACK_SX}>
      <SelectTargetModal
        open={hubPickerOpen}
        setOpen={setHubPickerOpen}
        title={HUB_PICKER.title}
        groups={[
          { label: HUB_PICKER.earnHubs, options: hubOptions.filter((option) => !option.disabled) },
          {
            label: HUB_PICKER.unavailableHubs,
            options: hubOptions.filter((option) => option.disabled),
          },
        ]}
        onSelect={(option) => {
          setHubPickerOpen(false);
          if (option.id !== hub.id) onChangeHub(option.hub);
        }}
      />
      <DynamicCard>
        <DynamicCard.Inner>
          {/* TODO: pass `onChangeToken` to let the asset be changed from here (SelectAssetModal). */}
          <TokenAmountInput
            title={MIGRATE_AMOUNT.title}
            label={MIGRATE_AMOUNT.balanceLabel}
            value={amount}
            onValueChange={setAmount}
            token={{
              symbol: currency.symbol,
              decimals: currency.decimals,
              iconSymbol,
            }}
            fiatRate={Number(supply.amount.usdPerToken)}
            max={available}
            disabled={signing}
          />
          <DynamicCard.Divider />
          <DescriptionItem
            label={MIGRATE_AMOUNT.earnApy.label}
            labelTooltip={MIGRATE_AMOUNT.earnApy.tooltip}
            value={pct(hub.apy)}
          />
        </DynamicCard.Inner>
      </DynamicCard>

      <DynamicCard>
        <DynamicCard.Inner>
          <DescriptionItem
            label={MIGRATE_AMOUNT.useAsCollateral.label}
            labelTooltip={MIGRATE_AMOUNT.useAsCollateral.tooltip}
            value={
              <Switch
                checked={useAsCollateral}
                onChange={(_, checked) => setWantsCollateral(checked)}
                disabled={!hub.canUseAsCollateral || signing}
                inputProps={{ 'aria-label': MIGRATE_AMOUNT.useAsCollateral.ariaLabel() }}
              />
            }
          />
        </DynamicCard.Inner>
      </DynamicCard>

      {previewAmount ? (
        <LivePreview
          opportunity={opportunity}
          hub={hub}
          useAsCollateral={useAsCollateral}
          onChangeHub={openHubPicker}
          user={user}
          supply={supply}
          amount={previewAmount}
          onPreviewed={setPreviewedKey}
        />
      ) : (
        <Preview
          opportunity={opportunity}
          hub={hub}
          useAsCollateral={useAsCollateral}
          onChangeHub={openHubPicker}
        />
      )}

      <DynamicCard>
        <DynamicCard.Inner>
          <DescriptionItem
            label={MIGRATION_TX_ROWS.networkFee.label}
            labelTooltip={MIGRATION_TX_ROWS.networkFee.tooltip}
            value={SPONSORED_BY_AAVE}
          />
        </DynamicCard.Inner>
      </DynamicCard>

      <Box sx={BUTTON_ROW_SX}>
        <Button
          component={Link}
          href={ROUTES.migrationToolV4}
          variant="outlined"
          size="large"
          disabled={signing}
        >
          {MIGRATION_TX_BUTTONS.cancel}
        </Button>
        <Button
          variant="contained"
          size="large"
          disabled={!canMigrate || readOnlyMode || contractWallet || signing}
          onClick={() =>
            migrateAmount &&
            migrate({
              user,
              market: {
                address: opportunity.market.address,
                chainId: opportunity.market.chain.chainId,
              },
              spoke: hub.id,
              position: {
                kind: 'earn',
                currency: currency.address,
                amount: migrateAmount,
                useAsCollateral,
              },
            })
          }
        >
          {signing && <CircularProgress color="inherit" size="1rem" sx={{ mr: 2 }} />}
          {signing ? <Trans>Confirm in your wallet</Trans> : MIGRATE_FLOW.title}
        </Button>
      </Box>
      {run.status === 'idle' && run.error && (
        <Typography variant="base" color="error.main" sx={{ textAlign: 'center' }}>
          {run.error instanceof FlashLoanUnavailableError ? (
            <Trans>
              There isn&apos;t enough liquidity to migrate this amount right now. Try a smaller
              amount or come back later.
            </Trans>
          ) : (
            <Trans>The migration couldn&apos;t be started. Please try again.</Trans>
          )}
        </Typography>
      )}
      {contractWallet && (
        <Typography variant="base" color="fg-3" sx={{ textAlign: 'center' }}>
          <Trans>
            Smart contract wallets can&apos;t migrate yet. Connect a wallet that signs with its own
            key.
          </Trans>
        </Typography>
      )}
      {readOnlyMode && (
        <Typography variant="base" color="fg-3" sx={{ textAlign: 'center' }}>
          <Trans>Read-only mode. Connect a wallet to migrate.</Trans>
        </Typography>
      )}
    </Box>
  );
};
