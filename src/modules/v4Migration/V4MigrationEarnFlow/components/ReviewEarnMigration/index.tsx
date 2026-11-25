import {
  bigDecimal,
  evmAddress,
  MigrationOpportunity,
  MigrationPreview,
  useMigrationEarnPreview,
} from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Switch, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { ReactNode, useEffect, useState } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { CuratorNames } from 'src/components/CuratorBy';
import { DynamicCard } from 'src/components/DynamicCard';
import { DescriptionItem } from 'src/components/DynamicCard/DescriptionItem';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenAmountInput } from 'src/components/TokenAmountInput';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import {
  collateralExposureRow,
  marketTitle,
  MIGRATE_AMOUNT,
  MIGRATE_FLOW,
  MIGRATION_TX_BUTTONS,
  MIGRATION_TX_ROWS,
  PREVIEW_ROWS,
  PREVIEW_TITLES,
  SPONSORED_BY_AAVE,
} from '../../../utils/copy';
import { NumberChange } from '../../../V4MigrationPage/components/ValueChange';
import { getMigrationMarketTitle } from '../../../V4MigrationPage/utils/markets';
import { getAssetIconSymbol, getHubDisplayName } from '../../../V4MigrationPage/utils/positions';
import { V4MigrationPreview, V4MigrationPreviewRow } from '../../../V4MigrationPreview';
import { PositionName } from '../../../V4MigrationPreview/components/PositionName';
import { FlashLoanUnavailableError, useEarnMigration } from '../../hooks/useEarnMigration';
import { EarnHub } from '../../utils/hubs';
import { MOCK_V3_COLLATERAL_EXPOSURE } from '../../utils/mocks';
import { EarnMigrationStatus } from '../EarnMigrationStatus';

type Supply = MigrationOpportunity['supplies'][number];

const STACK_SX = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const BUTTON_ROW_SX = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } as const;

const PREVIEW_DEBOUNCE_MS = 400;

const pct = (value: number) => <FormattedNumber value={value} percent variant="inherit" />;

const usd = (value: number) => <FormattedNumber value={value} symbol="USD" variant="inherit" />;

/** A before/after cell, or nothing when the API has no figure for either side. */
const change = (
  variation: { current: string | null; after: string | null } | undefined,
  format: 'percent' | 'usd' | 'number'
): ReactNode => {
  if (!variation || variation.current === null) return undefined;
  const value = {
    current: Number(variation.current),
    after: variation.after === null ? undefined : Number(variation.after),
  };
  if (format === 'number') return <NumberChange value={value} />;
  return format === 'percent' ? (
    <NumberChange value={value} percent />
  ) : (
    <NumberChange value={value} symbol="USD" />
  );
};

const previewRows = ({
  opportunity,
  hub,
  preview,
  loading,
  useAsCollateral,
}: {
  opportunity: MigrationOpportunity;
  hub: EarnHub;
  preview?: MigrationPreview;
  loading: boolean;
  useAsCollateral: boolean;
}): V4MigrationPreviewRow[] => {
  const source = preview?.source;
  const target = preview?.target;
  const curators = (target?.hubs ?? [])
    .map((targetHub) => targetHub.externalCurator)
    .filter((curator): curator is NonNullable<typeof curator> => !!curator)
    .map(({ name, icon }) => ({ name, icon }));
  const apy = target?.apy?.after?.value;
  const earnings = target?.yearlyEarningsUsd?.after;

  return [
    {
      id: 'market',
      ...PREVIEW_ROWS.market,
      v3: marketTitle(getMigrationMarketTitle(opportunity.market)),
      // TODO: pass `onClick` to let the hub be changed from here (SelectTargetModal).
      v4: <PositionName hubName={hub.name} />,
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
      // Mocked: the API does not say which assets share risk on either side yet.
      id: 'exposure',
      ...collateralExposureRow(getHubDisplayName(hub.name)),
      v3: <AssetGroup symbols={MOCK_V3_COLLATERAL_EXPOSURE.map(getAssetIconSymbol)} size={20} />,
      v4: <AssetGroup symbols={hub.backingCollateral.map(getAssetIconSymbol)} size={20} />,
    },
  ];
};

/** Identifies one preview request, so a confirmation is never applied to a different amount. */
const previewKey = (amount: string, useAsCollateral: boolean) => `${amount}:${useAsCollateral}`;

interface PreviewProps {
  opportunity: MigrationOpportunity;
  hub: EarnHub;
  useAsCollateral: boolean;
}

const Preview = ({
  opportunity,
  hub,
  useAsCollateral,
  preview,
  loading = false,
}: PreviewProps & { preview?: MigrationPreview; loading?: boolean }) => (
  <V4MigrationPreview
    title={PREVIEW_TITLES.earn}
    rows={previewRows({ opportunity, hub, preview, loading, useAsCollateral })}
  />
);

/** The preview on live data. Only mounted with an amount to move, as the hook cannot be paused. */
const LivePreview = ({
  opportunity,
  hub,
  useAsCollateral,
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
    user: evmAddress(user),
    market: {
      address: opportunity.market.address,
      chainId: opportunity.market.chain.chainId,
    },
    currency: supply.currency.address,
    spoke: evmAddress(hub.id),
    amount: bigDecimal(amount),
    useAsCollateral,
  });

  // The hook returns no data while it loads, so data here is always for the current request.
  const previewed = data?.target.status === 'PREVIEWED';
  useEffect(() => {
    if (previewed) onPreviewed(previewKey(amount, useAsCollateral));
  }, [previewed, amount, useAsCollateral, onPreviewed]);

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
}

/** Second step of the earn flow: how much to move to the picked hub, and what that changes. */
export const ReviewEarnMigration = ({
  user,
  opportunity,
  supply,
  hub,
}: ReviewEarnMigrationProps) => {
  const { currency } = supply;
  const available = new BigNumber(supply.amount.amount.value);
  const [amount, setAmount] = useState<BigNumber | null>(available);
  const debouncedAmount = useDebouncedValue(amount, PREVIEW_DEBOUNCE_MS);
  const { readOnlyMode } = useWeb3Context();
  const { run, migrate, reset } = useEarnMigration();
  const [useAsCollateral, setUseAsCollateral] = useState(false);
  // The opportunities list never says whether the hub takes this asset as collateral, so ask the
  // preview once with the flag on: it only answers PREVIEWED when it does.
  const collateralProbe = useMigrationEarnPreview({
    user: evmAddress(user),
    market: {
      address: opportunity.market.address,
      chainId: opportunity.market.chain.chainId,
    },
    currency: currency.address,
    spoke: evmAddress(hub.id),
    amount: bigDecimal(available.decimalPlaces(currency.decimals, BigNumber.ROUND_DOWN).toFixed()),
    useAsCollateral: true,
  });
  const canUseAsCollateral = collateralProbe.data?.target.status === 'PREVIEWED';

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
  const canMigrate = !!migrateAmount && previewedKey === previewKey(migrateAmount, useAsCollateral);

  if (run.status !== 'idle' && run.status !== 'signing' && migrateAmount) {
    return (
      <EarnMigrationStatus
        status={run.status}
        chainId={opportunity.market.chain.chainId}
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

  return (
    <Box sx={STACK_SX}>
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
                onChange={(_, checked) => setUseAsCollateral(checked)}
                disabled={!canUseAsCollateral || signing}
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
          user={user}
          supply={supply}
          amount={previewAmount}
          onPreviewed={setPreviewedKey}
        />
      ) : (
        <Preview opportunity={opportunity} hub={hub} useAsCollateral={useAsCollateral} />
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
          disabled={!canMigrate || readOnlyMode || signing}
          onClick={() =>
            migrateAmount &&
            migrate({
              user,
              market: {
                address: opportunity.market.address,
                chainId: opportunity.market.chain.chainId,
              },
              currency: currency.address,
              spoke: hub.id,
              amount: migrateAmount,
              useAsCollateral,
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
      {readOnlyMode && (
        <Typography variant="base" color="fg-3" sx={{ textAlign: 'center' }}>
          <Trans>Read-only mode. Connect a wallet to migrate.</Trans>
        </Typography>
      )}
    </Box>
  );
};
