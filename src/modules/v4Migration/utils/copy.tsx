import { Plural, t, Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import type { TxStatus } from 'src/components/transactions/FlowCommons/TxStatusHeader';

export const MIGRATE_FLOW = {
  title: <Trans>Migrate</Trans>,
  selectHubSubheading: (chain: ReactNode) => (
    <Trans>Select a hub to migrate your position on {chain}</Trans>
  ),
  reviewSubheading: (chain: ReactNode) => (
    <Trans>Review your position migration from Aave V3 to Aave V4 on {chain}</Trans>
  ),
};

const WIDE_ONLY_SX = { display: { xs: 'none', xsm: 'inline' } } as const;
const NARROW_ONLY_SX = { display: { xs: 'inline', xsm: 'none' } } as const;

export const searchEarnHubsPlaceholder = () => t`Search earn hubs`;
export const searchMarketsPlaceholder = () => t`Search markets`;

export const MIGRATE_AMOUNT = {
  title: <Trans>Amount</Trans>,
  availableToMigrate: <Trans>Available to Migrate</Trans>,
  balanceLabel: (
    <>
      <Box component="span" sx={WIDE_ONLY_SX}>
        <Trans>Available to Migrate</Trans>
      </Box>
      <Box component="span" sx={NARROW_ONLY_SX}>
        <Trans>Available</Trans>
      </Box>
    </>
  ),
  chooseAsset: <Trans>Choose Asset</Trans>,
  earnApy: {
    label: <Trans>Earn APY</Trans>,
    tooltip: (
      <Trans>Includes the base APY, active rewards, and any estimated underlying yield</Trans>
    ),
  },
  useAsCollateral: {
    label: <Trans>Use as Collateral</Trans>,
    ariaLabel: () => t`Use as Collateral`,
    tooltip: (
      <Trans>
        This asset can be used as collateral and will affect your borrowing power and Health Factor
      </Trans>
    ),
  },
  migrateAmount: {
    label: <Trans>Migrate Amount</Trans>,
    tooltip: (
      <Trans>
        How much of this position moves to V4. Collateral and debt move in the same proportion.
      </Trans>
    ),
  },
  collateralMoving: {
    label: <Trans>Collateral value moving</Trans>,
    tooltip: <Trans>The value of the collateral that moves at this amount</Trans>,
  },
  borrowMoving: {
    label: <Trans>Borrow value moving</Trans>,
    tooltip: <Trans>The value of the debt that moves at this amount</Trans>,
  },
  netMoving: {
    label: <Trans>Net balance moving</Trans>,
    tooltip: <Trans>Collateral value moving minus borrow value moving</Trans>,
  },
};

export const PREVIEW_TITLES = {
  earn: <Trans>Migration preview</Trans>,
  borrow: <Trans>Position after migration</Trans>,
};

export const PREVIEW_ROWS = {
  market: {
    label: <Trans>Market</Trans>,
    tooltip: <Trans>The market where your assets are deposited and your position is managed</Trans>,
  },
  curator: {
    label: <Trans>Curator</Trans>,
    tooltip: (
      <Trans>
        An external party that manages the risk and assets of one or more hubs and markets
      </Trans>
    ),
  },
  earnApy: {
    label: <Trans>Earn APY</Trans>,
    tooltip: <Trans>Current annualized rate earned on deposits</Trans>,
  },
  earnEarnings: {
    label: <Trans>Est. Annual earnings</Trans>,
    tooltip: <Trans>Interest your deposits earn over a year at the current APY</Trans>,
  },
  netBalance: {
    label: <Trans>Net balance</Trans>,
    tooltip: <Trans>Total value of your supplied assets minus your outstanding debt</Trans>,
  },
  positionApy: {
    label: <Trans>Position APY</Trans>,
    tooltip: (
      <Trans>
        Your annualized return for this position after combining deposit yield and borrow costs
      </Trans>
    ),
  },
  borrowEarnings: {
    label: <Trans>Est. Annual earnings</Trans>,
    tooltip: (
      <Trans>Estimated annual earnings based on your current position and market conditions</Trans>
    ),
  },
  borrowingPower: {
    label: <Trans>Borrowing power</Trans>,
    tooltip: (
      <Trans>
        Amount you can still borrow before your position becomes eligible for liquidation
      </Trans>
    ),
  },
  collateralValue: {
    label: <Trans>Collateral value</Trans>,
    tooltip: (
      <Trans>
        The value of your deposits that counts as collateral for borrowing. This is determined by
        each asset’s collateral factor
      </Trans>
    ),
  },
  collateral: {
    label: <Trans>Collateral</Trans>,
    tooltip: <Trans>Collateral currently supporting your borrows</Trans>,
  },
  borrowedValue: {
    label: <Trans>Borrowed value</Trans>,
    tooltip: <Trans>Total value you have borrowed for this asset</Trans>,
  },
  borrowed: {
    label: <Trans>Borrowed</Trans>,
    tooltip: <Trans>Amount you have borrowed in this position</Trans>,
  },
  healthFactor: {
    label: <Trans>Health factor</Trans>,
    tooltip: (
      <Trans>
        A ratio of your total collateral value to total debt. Below 1.0, your position can be
        liquidated.
      </Trans>
    ),
  },
};

export const collateralExposureRow = (hubName: string) => ({
  label: <Trans>Collateral Exposure</Trans>,
  tooltip: <Trans>Assets that share liquidity and risk within the {hubName} Hub</Trans>,
});

export const hubTitle = (hub: string) => <Trans>{hub} Hub</Trans>;

export const marketTitle = (market: string) => <Trans>{market} Market</Trans>;

export const HUB_PICKER = {
  title: <Trans>Choose Hub</Trans>,
  earnHubs: <Trans>Earn Hubs</Trans>,
  hubs: <Trans>Hubs</Trans>,
  unavailableHubs: <Trans>Unavailable Hubs</Trans>,
};

const COLLATERAL_FACTOR_SX = { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } as const;

export const MARKET_PICKER = {
  title: <Trans>Choose Borrow Market</Trans>,
  existingPositions: <Trans>Your Existing V4 Positions</Trans>,
  existingPositionsTooltip: (symbol: string) => (
    <Trans>
      Markets where you already have a position. The migrated {symbol} is added as collateral to
      that position.
    </Trans>
  ),
  opportunities: <Trans>Market Opportunities</Trans>,
  opportunitiesTooltip: (symbol: string) => (
    <Trans>
      Markets that accept {symbol} as collateral. Migrating opens a new position in that market.
    </Trans>
  ),
  borrowable: <Trans>Borrowable</Trans>,
  collateralFactor: (factor: number) => (
    <Box component="span" sx={COLLATERAL_FACTOR_SX}>
      <Trans>
        CF <FormattedNumber value={factor} percent visibleDecimals={0} variant="inherit" />
      </Trans>
    </Box>
  ),
};

const SETTLED_TITLES: Record<Exclude<TxStatus, 'pending' | 'success'>, ReactNode> = {
  error: <Trans>Migration Failed</Trans>,
  cancelled: <Trans>Migration Cancelled</Trans>,
  expired: <Trans>Migration Expired</Trans>,
};

export const migrationTxTitle = (status: TxStatus, symbol?: string): ReactNode => {
  if (status === 'pending') {
    return symbol ? <Trans>Migrating {symbol}</Trans> : <Trans>Migrating Position</Trans>;
  }
  if (status === 'success') {
    return symbol ? <Trans>Migrated {symbol}</Trans> : <Trans>Migrated Position</Trans>;
  }
  return SETTLED_TITLES[status];
};

export const MIGRATION_TX_ROWS = {
  migrating: { label: <Trans>Migrating</Trans>, tooltip: <Trans>Amount migrated</Trans> },
  migrated: { label: <Trans>Migrated</Trans>, tooltip: <Trans>Amount migrated</Trans> },
  value: {
    label: <Trans>Value</Trans>,
    tooltip: <Trans>The value of the transaction in selected currency</Trans>,
  },
  hub: {
    label: <Trans>Hub</Trans>,
    tooltip: <Trans>The hub where your position is held.</Trans>,
  },
  earnApy: PREVIEW_ROWS.earnApy,
  collateralValue: {
    label: <Trans>Collateral Value</Trans>,
    tooltip: PREVIEW_ROWS.collateralValue.tooltip,
  },
  collateral: PREVIEW_ROWS.collateral,
  borrowedValue: {
    label: <Trans>Borrowed Value</Trans>,
    tooltip: PREVIEW_ROWS.borrowedValue.tooltip,
  },
  borrow: { label: <Trans>Borrow</Trans>, tooltip: <Trans>Amount borrowed</Trans> },
  market: PREVIEW_ROWS.market,
  positionApy: PREVIEW_ROWS.positionApy,
  date: {
    label: <Trans>Transaction Date</Trans>,
    tooltip: <Trans>The date and time of the transaction</Trans>,
  },
  networkFee: {
    label: <Trans>Network Fee</Trans>,
    tooltip: <Trans>The network fee paid for the transaction</Trans>,
  },
  block: {
    label: <Trans>Block</Trans>,
    tooltip: <Trans>Block number when this transaction was mined</Trans>,
  },
  transactions: {
    label: <Trans>Transactions</Trans>,
    tooltip: <Trans>The number of transactions in this migration</Trans>,
  },
};

export const MIGRATION_TX_BUTTONS = {
  cancel: <Trans>Cancel</Trans>,
  viewPosition: <Trans>View Position</Trans>,
  tryAgain: <Trans>Try Again</Trans>,
  close: <Trans>Close</Trans>,
};

export const SPONSORED_BY_AAVE = (
  <Box component="span" sx={{ color: 'purple-2' }}>
    <Trans>Sponsored by Aave</Trans>
  </Box>
);

export const MIGRATION_BANNER = {
  eligibleDescription: (markets: number) => (
    <Plural
      value={markets}
      one="You have positions across # market eligible to migrate for improved rates and additional features"
      other="You have positions across # markets eligible to migrate for improved rates and additional features"
    />
  ),
  borrowDescription: (
    <Trans>Move your positions to V4 for better rates and more ways to supply and borrow.</Trans>
  ),
  compact: {
    earn: <Trans>Earn more on your supply.</Trans>,
    borrow: <Trans>Lower your borrow rate.</Trans>,
    earnAndBorrow: <Trans>Earn more and borrow at a lower rate.</Trans>,
  },
  earnApy: PREVIEW_ROWS.earnApy,
  borrowApy: {
    label: <Trans>Borrow APY</Trans>,
    tooltip: <Trans>Annual rate charged for borrowing this asset</Trans>,
  },
  earnExtra: <Trans>Earn an extra</Trans>,
  eligibleToMigrate: <Trans>Eligible to Migrate</Trans>,
  apy: <Trans>APY</Trans>,
  healthFactor: <Trans>Health Factor</Trans>,
};
