import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { BorrowMigrationPosition } from '../../utils/types';
import { AssetStack } from '../AssetStack';
import { PositionsColumn, PositionsTable } from '../PositionsTable';
import { ValueChange } from '../ValueChange';

const COLUMNS: PositionsColumn<BorrowMigrationPosition>[] = [
  {
    key: 'chain',
    title: <Trans>Chain</Trans>,
    width: 64,
    isRow: true,
    inCardHeader: true,
    getSortValue: (position) => getNetworkConfig(position.chainId).name,
    render: (position) => (
      <MarketLogo
        size={24}
        logo={getNetworkConfig(position.chainId).networkLogoPath}
        sx={{ mr: 0 }}
      />
    ),
  },
  {
    key: 'market',
    title: <Trans>Market</Trans>,
    flex: 1.13,
    inCardHeader: true,
    getSortValue: (position) => position.marketName,
    render: (position) => (
      <Typography variant="h5" color="fg-1" noWrap>
        {position.marketName}
      </Typography>
    ),
  },
  {
    key: 'netBalance',
    title: <Trans>Net balance</Trans>,
    getSortValue: (position) => position.netBalanceUSD,
    render: (position) => (
      <FormattedNumber
        value={position.netBalanceUSD}
        symbol="USD"
        compact
        variant="h5"
        color="fg-1"
      />
    ),
  },
  {
    key: 'collateral',
    title: <Trans>Collateral</Trans>,
    getSortValue: (position) => position.collateralUSD,
    render: (position) => <AssetStack assets={position.collateral} />,
  },
  {
    key: 'borrowed',
    title: <Trans>Borrowed</Trans>,
    getSortValue: (position) => position.borrowedUSD,
    render: (position) => <AssetStack assets={position.borrowed} />,
  },
  {
    key: 'borrowApy',
    title: <Trans>Net borrow APY</Trans>,
    getSortValue: (position) => position.borrowApy?.after ?? -Infinity,
    render: (position) =>
      position.borrowApy ? (
        <ValueChange
          current={<FormattedNumber value={position.borrowApy.current} percent variant="inherit" />}
          after={<FormattedNumber value={position.borrowApy.after} percent variant="inherit" />}
        />
      ) : (
        <NoData />
      ),
  },
  {
    key: 'healthFactor',
    title: <Trans>Health factor</Trans>,
    getSortValue: (position) => Number(position.healthFactor.after),
    render: ({ healthFactor }) => (
      <ValueChange
        current={
          <HealthFactorNumber
            value={healthFactor.current}
            variant="inherit"
            sx={{ color: 'inherit' }}
          />
        }
        after={<HealthFactorNumber value={healthFactor.after} variant="inherit" withHeart />}
      />
    ),
  },
];

interface BorrowPositionsTableProps {
  positions: BorrowMigrationPosition[];
  onMigrate?: (position: BorrowMigrationPosition) => void;
}

export const BorrowPositionsTable = ({ positions, onMigrate }: BorrowPositionsTableProps) => (
  <PositionsTable
    title={<Trans>Borrow</Trans>}
    positions={positions}
    columns={COLUMNS}
    sortSource="V4 Migration Borrow"
    onMigrate={onMigrate}
  />
);
