import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { CuratorNames } from 'src/components/CuratorBy';
import { DynamicCard } from 'src/components/DynamicCard';
import { DescriptionItem } from 'src/components/DynamicCard/DescriptionItem';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { InputRange } from 'src/components/InputRange';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { SelectTargetModal } from 'src/components/SelectTargetModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ValueChange } from 'src/modules/v4Migration/V4MigrationPage/components/ValueChange';

import { FlashLoanUnavailableError, useMigration } from '../../../hooks/useMigration';
import {
  MigrationOpportunity,
  MigrationPreview,
  useMigrationBorrowPreview,
} from '../../../hooks/useMigrationApi';
import { useSignsWithOwnKey } from '../../../hooks/useSignsWithOwnKey';
import {
  MARKET_PICKER,
  marketTitle,
  MIGRATE_AMOUNT,
  MIGRATE_FLOW,
  MIGRATION_TX_BUTTONS,
  MIGRATION_TX_ROWS,
  PREVIEW_ROWS,
  PREVIEW_TITLES,
  SPONSORED_BY_AAVE,
} from '../../../utils/copy';
import {
  change,
  healthFactor,
  healthFactorChange,
  pct,
  tokens,
  usd,
} from '../../../utils/previewCells';
import { getMigrationMarketTitle } from '../../../V4MigrationPage/utils/markets';
import {
  getAssetIconSymbol,
  getHubDisplayName,
  getMarketDisplayName,
} from '../../../V4MigrationPage/utils/positions';
import { V4MigrationPreview, V4MigrationPreviewRow } from '../../../V4MigrationPreview';
import { PositionName } from '../../../V4MigrationPreview/components/PositionName';
import { BorrowMarket } from '../../utils/markets';
import { BorrowMigrationStatus } from '../BorrowMigrationStatus';

/** A supply or a debt: what the two have in common. */
type Holding = Pick<MigrationOpportunity['supplies'][number], 'currency' | 'amount'>;
type Leg = MigrationPreview['target']['legs'][number];

const STACK_SX = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const BUTTON_ROW_SX = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } as const;

const STOPS = [0, 25, 50, 75, 100];

const iconSymbols = (holdings: Holding[]) =>
  holdings.map((holding) => getAssetIconSymbol(holding.currency));

const sameAsset = (a: { address: string }, b: { address: string }) =>
  a.address.toLowerCase() === b.address.toLowerCase();

/**
 * One asset on both sides: what stays on V3 next to what it was, and what the V4 position holds
 * of it once the move lands.
 */
const assetCells = (
  holding: Holding,
  remaining: Holding | undefined,
  leg: Leg | undefined,
  side: 'supplied' | 'borrowed'
): Pick<V4MigrationPreviewRow, 'v3' | 'v4'> => {
  const { symbol } = holding.currency;
  const icon = getAssetIconSymbol(holding.currency);
  const landed = leg?.[side].after.value;

  return {
    v3: (
      <ValueChange
        current={tokens(symbol, holding.amount.amount.value)}
        // An asset that moves in full is gone from V3 afterwards.
        after={tokens(symbol, remaining?.amount.amount.value ?? '0', icon)}
      />
    ),
    v4: landed === undefined ? undefined : tokens(symbol, landed, icon),
  };
};

/**
 * The row for the position's collateral or its debt. A single asset fits on the row itself;
 * several show as icons, with one line per asset underneath.
 */
const assetsRow = (
  id: string,
  copy: Pick<V4MigrationPreviewRow, 'label' | 'tooltip'>,
  side: 'supplied' | 'borrowed',
  holdings: Holding[],
  remaining: Holding[] | undefined,
  legs: Leg[] | undefined,
  loading: boolean
): V4MigrationPreviewRow => {
  const cells = holdings.map((holding) => ({
    id: `${id}-${holding.currency.address}`,
    ...(remaining && legs
      ? assetCells(
          holding,
          remaining.find((item) => sameAsset(item.currency, holding.currency)),
          legs.find((leg) => sameAsset(leg.currency, holding.currency)),
          side
        )
      : {}),
    loading,
  }));

  if (cells.length === 1) return { ...cells[0], id, ...copy };

  const icons = <AssetGroup symbols={iconSymbols(holdings)} size={20} />;
  return { id, ...copy, v3: icons, v4: icons, details: cells };
};

const previewRows = ({
  opportunity,
  market,
  preview,
  loading,
  onChangeMarket,
}: {
  opportunity: MigrationOpportunity;
  market: BorrowMarket;
  preview?: MigrationPreview;
  loading: boolean;
  onChangeMarket?: () => void;
}): V4MigrationPreviewRow[] => {
  const source = preview?.source;
  const target = preview?.target;
  // The hubs the position's assets sit in, known before any preview from the V4 API; the
  // preview's own are the fallback if that call failed.
  const hubs = (market.hubs.length ? market.hubs : target?.hubs ?? [])
    .map((hub) => getHubDisplayName(hub.name))
    .join(', ');
  const curators = (target?.hubs ?? [])
    .map((targetHub) => targetHub.externalCurator)
    .filter((curator): curator is NonNullable<typeof curator> => !!curator)
    .map(({ name, icon }) => ({ name, icon }));

  const v3 = <K extends 'netBalanceUsd' | 'yearlyEarningsUsd' | 'suppliedUsd' | 'borrowedUsd'>(
    field: K
  ) => change(source && { current: source.current[field], after: source.after[field] }, 'usd');
  // The V4 column is the position once the move lands, as the table's title says.
  const v4Usd = (value: string | null | undefined) =>
    value === null || value === undefined ? undefined : usd(Number(value));

  return [
    {
      id: 'market',
      ...PREVIEW_ROWS.market,
      v3: marketTitle(`V3 ${getMigrationMarketTitle(opportunity.market)}`),
      v4: <PositionName hubName={hubs} marketName={market.name} onClick={onChangeMarket} />,
    },
    {
      id: 'curator',
      ...PREVIEW_ROWS.curator,
      v4: curators.length ? <CuratorNames curators={curators} /> : undefined,
      loading,
    },
    {
      id: 'netBalance',
      ...PREVIEW_ROWS.netBalance,
      v3: v3('netBalanceUsd'),
      v4: v4Usd(target?.netBalanceUsd?.after),
      loading,
    },
    {
      id: 'positionApy',
      ...PREVIEW_ROWS.positionApy,
      v3: change(
        source && {
          current: source.current.apy?.value ?? null,
          after: source.after.apy?.value ?? null,
        },
        'percent'
      ),
      v4: target?.apy?.after ? pct(Number(target.apy.after.value)) : undefined,
      loading,
    },
    {
      id: 'earnings',
      ...PREVIEW_ROWS.borrowEarnings,
      v3: v3('yearlyEarningsUsd'),
      v4: v4Usd(target?.yearlyEarningsUsd?.after),
      loading,
    },
    {
      id: 'borrowingPower',
      ...PREVIEW_ROWS.borrowingPower,
      v3: change(
        source && {
          current: source.current.availableBorrowsBase,
          after: source.after.availableBorrowsBase,
        },
        'usd'
      ),
      v4: v4Usd(target?.borrowingPowerUsd?.after),
      loading,
    },
    {
      id: 'collateralValue',
      ...PREVIEW_ROWS.collateralValue,
      v3: v3('suppliedUsd'),
      v4: v4Usd(target?.collateralUsd?.after),
      loading,
    },
    assetsRow(
      'collateral',
      PREVIEW_ROWS.collateral,
      'supplied',
      opportunity.supplies,
      source?.after.supplies,
      target?.legs,
      loading
    ),
    {
      id: 'borrowedValue',
      ...PREVIEW_ROWS.borrowedValue,
      v3: v3('borrowedUsd'),
      v4: v4Usd(target?.debtUsd?.after),
      loading,
    },
    assetsRow(
      'borrowed',
      PREVIEW_ROWS.borrowed,
      'borrowed',
      opportunity.debts,
      source?.after.debts,
      target?.legs,
      loading
    ),
    {
      id: 'healthFactor',
      ...PREVIEW_ROWS.healthFactor,
      v3: healthFactorChange(
        source && { current: source.current.healthFactor, after: source.after.healthFactor }
      ),
      v4: target?.healthFactor?.after ? healthFactor(target.healthFactor.after) : undefined,
      loading,
    },
  ];
};

interface PreviewProps {
  opportunity: MigrationOpportunity;
  market: BorrowMarket;
  /** Opens the list of markets. Missing when there is no other market to move to. */
  onChangeMarket?: () => void;
}

const Preview = ({
  opportunity,
  market,
  onChangeMarket,
  preview,
  loading = false,
}: PreviewProps & { preview?: MigrationPreview; loading?: boolean }) => (
  <V4MigrationPreview
    title={PREVIEW_TITLES.borrow}
    rows={previewRows({ opportunity, market, preview, loading, onChangeMarket })}
  />
);

/** A preview the API answered `PREVIEWED` for, and the market and share it was asked for. */
interface ConfirmedPreview {
  marketId: string;
  percentage: number;
  preview: MigrationPreview;
}

/** The preview on live data. Only mounted with a share to move, as the hook cannot be paused. */
const LivePreview = ({
  opportunity,
  market,
  onChangeMarket,
  user,
  percentage,
  onPreviewed,
}: PreviewProps & {
  user: string;
  percentage: number;
  /** Called once the API confirms this share of the position can be migrated. */
  onPreviewed: (confirmed: ConfirmedPreview) => void;
}) => {
  const { data, loading, error } = useMigrationBorrowPreview({
    user: user,
    market: {
      address: opportunity.market.address,
      chainId: opportunity.market.chain.chainId,
    },
    spoke: market.id,
    percentage: String(percentage),
  });

  // The hook returns no data while it loads, so data here is always for the current request.
  useEffect(() => {
    if (data?.target.status === 'PREVIEWED') {
      onPreviewed({ marketId: market.id, percentage, preview: data });
    }
  }, [data, market.id, percentage, onPreviewed]);

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
          <Trans>
            The market can&apos;t take this share of the position right now. Try another amount or
            market.
          </Trans>
        }
      />
    );
  }

  return (
    <Preview
      opportunity={opportunity}
      market={market}
      onChangeMarket={onChangeMarket}
      preview={data}
      loading={loading}
    />
  );
};

interface ReviewBorrowMigrationProps {
  user: string;
  opportunity: MigrationOpportunity;
  market: BorrowMarket;
  /** Every market that lists the position's assets, the picked one included. */
  markets: BorrowMarket[];
  onChangeMarket: (market: BorrowMarket) => void;
}

/** Second step of the borrow flow: how much of the position to move, and what that changes. */
export const ReviewBorrowMigration = ({
  user,
  opportunity,
  market,
  markets,
  onChangeMarket,
}: ReviewBorrowMigrationProps) => {
  const [percent, setPercent] = useState(100);
  // The slider reports every pixel of a drag; the preview only follows where it comes to rest.
  const [previewPercent, setPreviewPercent] = useState(percent);
  const share = percent / 100;
  const { readOnlyMode } = useWeb3Context();
  const { run, migrate, reset } = useMigration();
  // Migrate stays off until the preview confirms exactly the share that is about to be sent.
  const [confirmed, setConfirmed] = useState<ConfirmedPreview>();
  const canMigrate =
    percent > 0 && confirmed?.marketId === market.id && confirmed.percentage === percent;
  const signing = run.status === 'signing';
  const chainId = opportunity.market.chain.chainId;
  // Permits authorise the move, and a contract wallet cannot sign them.
  const contractWallet = useSignsWithOwnKey(user, chainId).data === false;
  const [marketPickerOpen, setMarketPickerOpen] = useState(false);

  if (run.status !== 'idle' && run.status !== 'signing' && confirmed) {
    return (
      <BorrowMigrationStatus
        status={run.status}
        chainId={chainId}
        user={user}
        spokeAddress={market.id}
        txHash={run.txHash}
        receipt={run.receipt}
        preview={confirmed.preview}
        marketName={market.name}
        onRetry={reset}
      />
    );
  }

  const marketOptions = markets.map((item) => ({
    id: item.id,
    kind: 'market' as const,
    name: marketTitle(getMarketDisplayName(item.name)),
    apy: item.apy,
    disabled: item.unavailable,
    market: item,
  }));
  const openMarketPicker =
    markets.length > 1 && !signing ? () => setMarketPickerOpen(true) : undefined;

  return (
    <Box sx={STACK_SX}>
      <SelectTargetModal
        open={marketPickerOpen}
        setOpen={setMarketPickerOpen}
        title={MARKET_PICKER.title}
        groups={[
          {
            label: MARKET_PICKER.markets,
            options: marketOptions.filter((option) => !option.disabled),
          },
          {
            label: MARKET_PICKER.unavailableMarkets,
            tooltip: MARKET_PICKER.unavailableMarketsTooltip,
            options: marketOptions.filter((option) => option.disabled),
          },
        ]}
        onSelect={(option) => {
          setMarketPickerOpen(false);
          if (option.id !== market.id) onChangeMarket(option.market);
        }}
      />
      <DynamicCard>
        <DynamicCard.Inner>
          <InputRange
            label={MIGRATE_AMOUNT.migrateAmount.label}
            tooltip={MIGRATE_AMOUNT.migrateAmount.tooltip}
            value={percent}
            onValueChange={setPercent}
            onValueCommit={setPreviewPercent}
            stops={STOPS}
            unit="%"
            disabled={signing}
          />
          <DynamicCard.Divider />
          <DescriptionItem
            label={MIGRATE_AMOUNT.collateralMoving.label}
            labelTooltip={MIGRATE_AMOUNT.collateralMoving.tooltip}
            value={
              <>
                <AssetGroup symbols={iconSymbols(opportunity.supplies)} size={20} />
                {usd(Number(opportunity.suppliedUsd ?? 0) * share)}
              </>
            }
          />
          <DescriptionItem
            label={MIGRATE_AMOUNT.borrowMoving.label}
            labelTooltip={MIGRATE_AMOUNT.borrowMoving.tooltip}
            value={
              <>
                <AssetGroup symbols={iconSymbols(opportunity.debts)} size={20} />
                {usd(Number(opportunity.borrowedUsd ?? 0) * share)}
              </>
            }
          />
          <DescriptionItem
            label={MIGRATE_AMOUNT.netMoving.label}
            labelTooltip={MIGRATE_AMOUNT.netMoving.tooltip}
            value={usd(Number(opportunity.netBalanceUsd ?? 0) * share)}
          />
        </DynamicCard.Inner>
      </DynamicCard>

      {previewPercent > 0 ? (
        <LivePreview
          opportunity={opportunity}
          market={market}
          onChangeMarket={openMarketPicker}
          user={user}
          percentage={previewPercent}
          onPreviewed={setConfirmed}
        />
      ) : (
        <Preview opportunity={opportunity} market={market} onChangeMarket={openMarketPicker} />
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
            migrate({
              user,
              market: { address: opportunity.market.address, chainId },
              spoke: market.id,
              position: { kind: 'borrow', percentage: percent },
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
