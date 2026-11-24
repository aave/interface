import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { AssetGroup } from 'src/components/AssetGroup';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { getAssetIconSymbol } from '../../utils/positions';
import { BorrowMigrationPosition } from '../../utils/types';
import { PositionsColumn, PositionsTable } from '../PositionsTable';
import { NumberChange, ValueChange } from '../ValueChange';

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
    getSortValue: (position) => position.netBalanceUSD ?? -Infinity,
    render: (position) =>
      position.netBalanceUSD !== undefined ? (
        <FormattedNumber
          value={position.netBalanceUSD}
          symbol="USD"
          compact
          variant="h5"
          color="fg-1"
        />
      ) : (
        <NoData />
      ),
  },
  {
    key: 'collateral',
    title: <Trans>Collateral</Trans>,
    getSortValue: (position) => position.collateralUSD,
    render: (position) => (
      <AssetGroup symbols={position.collateral.map(getAssetIconSymbol)} animated={false} />
    ),
  },
  {
    key: 'borrowed',
    title: <Trans>Borrowed</Trans>,
    getSortValue: (position) => position.borrowedUSD,
    render: (position) => (
      <AssetGroup symbols={position.borrowed.map(getAssetIconSymbol)} animated={false} />
    ),
  },
  {
    key: 'borrowApy',
    title: <Trans>Net borrow APY</Trans>,
    getSortValue: (position) =>
      position.borrowApy?.after ?? position.borrowApy?.current ?? -Infinity,
    render: (position) =>
      position.borrowApy ? <NumberChange value={position.borrowApy} percent /> : <NoData />,
  },
  {
    key: 'healthFactor',
    title: <Trans>Health factor</Trans>,
    getSortValue: (position) =>
      Number(position.healthFactor?.after ?? position.healthFactor?.current ?? -Infinity),
    render: ({ healthFactor }) =>
      healthFactor ? (
        <ValueChange
          current={
            <HealthFactorNumber
              value={healthFactor.current}
              variant="inherit"
              sx={{ color: 'inherit' }}
            />
          }
          after={
            healthFactor.after !== undefined ? (
              <HealthFactorNumber value={healthFactor.after} variant="inherit" withHeart />
            ) : undefined
          }
        />
      ) : (
        <NoData />
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
