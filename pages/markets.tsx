import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { Trans } from '@lingui/macro';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { MainLayout } from 'src/layouts/MainLayout';
import { MarketsTopPanel } from '../src/modules/markets/MarketsTopPanel';

export default function Markets() {
  const { reserves } = useAppDataContext();
  const { currentMarketData } = useProtocolDataContext();

  return (
    <Container maxWidth="lg">
      <MarketsTopPanel />
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // alignItems: 'center',
          //justifyContent: 'center',
        }}
      >
        <Typography typography="h2" sx={{ p: 4 }}>
          {currentMarketData.marketTitle} <Trans>market assets</Trans>
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="right">Total supplied</TableCell>
              <TableCell align="right">Supply APY</TableCell>
              <TableCell align="right">Total borrowed</TableCell>
              <TableCell align="right">Borrow APY, variable</TableCell>
              <TableCell align="right">Borrow APY, stable</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reserves.map((reserve) => (
              <TableRow key={reserve.id}>
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex' }}>
                    <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
                    <Box sx={{ pl: 2 }}>
                      <Typography>{reserve.name}</Typography>
                      <Typography>{reserve.symbol}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <FormattedNumber
                    compact
                    value={reserve.totalLiquidityUSD}
                    maximumDecimals={2}
                    minimumDecimals={2}
                  />
                </TableCell>
                <TableCell align="right">
                  <FormattedNumber
                    compact
                    value={reserve.supplyAPY}
                    maximumDecimals={2}
                    minimumDecimals={2}
                    percent
                  />
                </TableCell>
                <TableCell align="right">
                  <FormattedNumber
                    compact
                    value={reserve.totalDebtUSD}
                    maximumDecimals={2}
                    minimumDecimals={2}
                  />
                </TableCell>
                <TableCell align="right">
                  <FormattedNumber
                    compact
                    value={reserve.variableBorrowAPY}
                    maximumDecimals={2}
                    minimumDecimals={2}
                    percent
                  />
                </TableCell>
                <TableCell align="right">
                  <FormattedNumber
                    compact
                    value={reserve.stableBorrowAPY}
                    maximumDecimals={2}
                    minimumDecimals={2}
                    percent
                  />
                </TableCell>
                <TableCell align="right">
                  <Button variant="outlined">Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
