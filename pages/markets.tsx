import { Trans } from '@lingui/macro';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { MainLayout } from 'src/layouts/MainLayout';
import AssetsList from 'src/modules/markets/AssetsList';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';

export default function Markets() {
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
          {currentMarketData.marketTitle} <Trans>assets</Trans>
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="center">Total supplied</TableCell>
              <TableCell align="center">Supply APY</TableCell>
              <TableCell align="center">Total borrowed</TableCell>
              <TableCell align="center">Borrow APY, variable</TableCell>
              <TableCell align="center">Borrow APY, stable</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            <AssetsList />
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
