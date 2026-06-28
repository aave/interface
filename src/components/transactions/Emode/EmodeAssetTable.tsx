import { Trans } from '@lingui/macro';
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ConfigStatus } from 'src/modules/reserve-overview/ReserveEModePanel';

interface EmodeAssetTableProps {
  assets: Array<{
    symbol: string;
    iconSymbol: string;
    collateral: boolean;
    borrowable: boolean;
    ltvzero: boolean;
  }>;
  maxHeight?: string;
}

export const EmodeAssetTable = ({ assets, maxHeight = '270px' }: EmodeAssetTableProps) => {
  return (
    <TableContainer sx={{ maxHeight }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              [`& .${tableCellClasses.root}`]: {
                py: 2,
                lineHeight: 0,
              },
            }}
          >
            <TableCell align="center" sx={{ pl: 0, width: '120px' }}>
              <Typography variant="helperText">
                <Trans>Asset</Trans>
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="helperText">
                <Trans>Boosted LTV</Trans>
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="helperText">
                <Trans>Borrowable</Trans>
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ width: '100%' }}>
          {assets.map((asset, index) => (
            <TableRow
              key={index}
              sx={{
                pt: 8,
                [`& .${tableCellClasses.root}`]: {
                  borderBottom: 'none',
                  pt: 3,
                  pb: 2,
                },
              }}
            >
              <TableCell align="center" sx={{ py: 1 }}>
                <Stack direction="row" gap={1} alignItems="center">
                  <TokenIcon symbol={asset.iconSymbol} sx={{ fontSize: '16px' }} />
                  <Typography variant="secondary12">{asset.symbol}</Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">
                <ConfigStatus
                  enabled={asset.collateral}
                  warning={asset.collateral && asset.ltvzero}
                />
              </TableCell>
              <TableCell align="center">
                <ConfigStatus enabled={asset.borrowable} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
