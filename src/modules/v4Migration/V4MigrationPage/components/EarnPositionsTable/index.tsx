import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { TABLE_CARDS_BELOW } from 'src/components/lists/listBreakpoints';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { EarnMigrationPosition } from '../../utils/types';
import { PositionsColumn, PositionsTable } from '../PositionsTable';
import { NumberChange } from '../ValueChange';

const COLUMNS: PositionsColumn<EarnMigrationPosition>[] = [
  {
    key: 'asset',
    title: <Trans>Asset</Trans>,
    flex: 1.7,
    isRow: true,
    inCardHeader: true,
    getSortValue: (position) => position.asset.name,
    render: ({ asset }) => {
      const { iconSymbol, name } = fetchIconSymbolAndName({
        underlyingAsset: asset.address,
        symbol: asset.symbol,
        name: asset.name,
      });

      return (
        <>
          <TokenIcon symbol={iconSymbol} sx={{ fontSize: '2.75rem' }} />
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', pl: 3.5, minWidth: 0 }}
          >
            <Typography variant="h5" color="fg-1" noWrap>
              {name || asset.name}
            </Typography>
            <Typography variant="base" color="fg-3" noWrap>
              {asset.symbol}
            </Typography>
          </Box>
        </>
      );
    },
  },
  {
    key: 'supplied',
    title: <Trans>Supplied</Trans>,
    getSortValue: (position) => Number(position.supplied.usd),
    render: (position) => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'flex-end', [TABLE_CARDS_BELOW]: 'flex-start' },
          gap: '0.375rem',
        }}
      >
        <FormattedNumber
          value={position.supplied.amount}
          symbol={position.asset.symbol}
          variant="h5"
          color="fg-1"
        />
        <FormattedNumber value={position.supplied.usd} symbol="USD" variant="base" color="fg-3" />
      </Box>
    ),
  },
  {
    key: 'supplyApy',
    title: <Trans>Earn APY</Trans>,
    getSortValue: (position) => position.supplyApy.after,
    render: (position) => <NumberChange value={position.supplyApy} percent />,
  },
  {
    key: 'projectedEarnings',
    title: <Trans>Change in earning</Trans>,
    getSortValue: (position) => position.projectedEarningsUSD.after,
    render: (position) => <NumberChange value={position.projectedEarningsUSD} symbol="USD" />,
  },
];

interface EarnPositionsTableProps {
  positions: EarnMigrationPosition[];
  onMigrate?: (position: EarnMigrationPosition) => void;
}

export const EarnPositionsTable = ({ positions, onMigrate }: EarnPositionsTableProps) => (
  <PositionsTable
    title={<Trans>Earn</Trans>}
    positions={positions}
    columns={COLUMNS}
    sortSource="V4 Migration Earn"
    onMigrate={onMigrate}
  />
);
