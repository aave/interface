import { Button, TableCell, TableRow, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

export default function AssetsList() {
  const { reserves } = useAppDataContext();

  return (
    <>
      {reserves.map((reserve) => (
        <TableRow key={reserve.id}>
          <TableCell component="th" scope="row">
            <Box sx={{ display: 'flex' }}>
              <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
              <Box sx={{ pl: 2 }}>
                <Typography variant="h4">{reserve.name}</Typography>
                <Typography variant="subheader2" color="text.disabled">
                  {reserve.symbol}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell align="center">
            <FormattedNumber
              compact
              value={reserve.totalLiquidityUSD}
              maximumDecimals={2}
              minimumDecimals={2}
              variant="main16"
              symbol="USD"
            />
          </TableCell>
          <TableCell align="center">
            <FormattedNumber
              compact
              value={reserve.supplyAPY}
              maximumDecimals={2}
              minimumDecimals={2}
              percent
              variant="main16"
            />
          </TableCell>
          <TableCell align="center">
            <FormattedNumber
              compact
              value={reserve.totalDebtUSD}
              maximumDecimals={2}
              minimumDecimals={2}
              variant="main16"
              symbol="USD"
            />
          </TableCell>
          <TableCell align="center">
            <FormattedNumber
              compact
              value={reserve.variableBorrowAPY}
              maximumDecimals={2}
              minimumDecimals={2}
              percent
              variant="main16"
            />
          </TableCell>
          <TableCell align="center">
            <FormattedNumber
              compact
              value={reserve.stableBorrowAPY}
              maximumDecimals={2}
              minimumDecimals={2}
              percent
              variant="main16"
            />
          </TableCell>
          <TableCell align="right">
            <Button
              variant="outlined"
              component={Link}
              href={ROUTES.reserveOverview(reserve.underlyingAsset)}
            >
              Details
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
