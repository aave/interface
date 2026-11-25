import {
  bigDecimal,
  evmAddress,
  MigrationOpportunity,
  MigrationPreview,
  useMigrationEarnPreview,
} from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, Button, Switch } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { ReactNode, useState } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { CuratorNames } from 'src/components/CuratorBy';
import { DynamicCard } from 'src/components/DynamicCard';
import { DescriptionItem } from 'src/components/DynamicCard/DescriptionItem';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenAmountInput } from 'src/components/TokenAmountInput';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';

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
import { EarnHub } from '../../utils/hubs';
import { MOCK_V3_COLLATERAL_EXPOSURE } from '../../utils/mocks';

type Supply = MigrationOpportunity['supplies'][number];

const STACK_SX = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const BUTTON_ROW_SX = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } as const;

const PREVIEW_DEBOUNCE_MS = 400;

// An earn position backs no debt on V3, and collateral on V4 means picking a market to borrow in,
// which this flow does not do yet. So the supply always moves as a plain deposit.
const USE_AS_COLLATERAL = false;

const pct = (value: number) => <FormattedNumber value={value} percent variant="inherit" />;

const usd = (value: number) => <FormattedNumber value={value} symbol="USD" variant="inherit" />;

/** A before/after cell, or nothing when the API has no figure for either side. */
const change = (
  variation: { current: string | null; after: string | null } | undefined,
  format: 'percent' | 'usd'
): ReactNode => {
  if (!variation || variation.current === null) return undefined;
  const value = {
    current: Number(variation.current),
    after: variation.after === null ? undefined : Number(variation.after),
  };
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
}: {
  opportunity: MigrationOpportunity;
  hub: EarnHub;
  preview?: MigrationPreview;
  loading: boolean;
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
      id: 'apy',
      ...PREVIEW_ROWS.earnApy,
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
    {
      // Mocked: the API does not say which assets share risk on either side yet.
      id: 'exposure',
      ...collateralExposureRow(getHubDisplayName(hub.name)),
      v3: <AssetGroup symbols={MOCK_V3_COLLATERAL_EXPOSURE.map(getAssetIconSymbol)} size={20} />,
      v4: <AssetGroup symbols={hub.backingCollateral.map(getAssetIconSymbol)} size={20} />,
    },
  ];
};

interface PreviewProps {
  opportunity: MigrationOpportunity;
  hub: EarnHub;
}

const Preview = ({
  opportunity,
  hub,
  preview,
  loading = false,
}: PreviewProps & { preview?: MigrationPreview; loading?: boolean }) => (
  <V4MigrationPreview
    title={PREVIEW_TITLES.earn}
    rows={previewRows({ opportunity, hub, preview, loading })}
  />
);

/** The preview on live data. Only mounted with an amount to move, as the hook cannot be paused. */
const LivePreview = ({
  opportunity,
  hub,
  user,
  supply,
  amount,
}: PreviewProps & { user: string; supply: Supply; amount: string }) => {
  const { data, loading, error } = useMigrationEarnPreview({
    user: evmAddress(user),
    market: {
      address: opportunity.market.address,
      chainId: opportunity.market.chain.chainId,
    },
    currency: supply.currency.address,
    spoke: evmAddress(hub.id),
    amount: bigDecimal(amount),
    useAsCollateral: USE_AS_COLLATERAL,
  });

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

  return <Preview opportunity={opportunity} hub={hub} preview={data} loading={loading} />;
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

  const previewAmount =
    debouncedAmount && debouncedAmount.gt(0) && debouncedAmount.lte(available)
      ? debouncedAmount.decimalPlaces(currency.decimals, BigNumber.ROUND_DOWN).toFixed()
      : undefined;

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
              iconSymbol: getAssetIconSymbol(currency),
            }}
            fiatRate={Number(supply.amount.usdPerToken)}
            max={available}
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
                checked={USE_AS_COLLATERAL}
                disabled
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
          user={user}
          supply={supply}
          amount={previewAmount}
        />
      ) : (
        <Preview opportunity={opportunity} hub={hub} />
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
        <Button component={Link} href={ROUTES.migrationToolV4} variant="outlined" size="large">
          {MIGRATION_TX_BUTTONS.cancel}
        </Button>
        {/* TODO: run the migration (signatures, then the transaction). */}
        <Button variant="contained" size="large" disabled>
          {MIGRATE_FLOW.title}
        </Button>
      </Box>
    </Box>
  );
};
