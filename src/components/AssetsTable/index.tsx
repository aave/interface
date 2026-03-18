import { Check, MoreHorizOutlined } from '@mui/icons-material';
import {
  Alert,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { ModalType } from 'src/components/Modals/types';
import { useModalStore } from 'src/store/useModalStore';

import { Paper } from './styles';

export default function AssetsTable({ type }: { type: 'supply' | 'borrow' }) {
  const isSupply = type === 'supply';
  const openModal = useModalStore((s) => s.openModal);

  type SortKey = 'assets' | 'walletBalance' | 'apy';
  const [sortKey, setSortKey] = useState<SortKey>('assets');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [isAlertShown, setIsAlertShown] = useState<boolean>(true);

  const rows = [
    { symbol: 'ETH', tokenIconSrc: '/icons/tokens/eth.svg', walletBalance: 0, apy: 1.86, canBeCollateral: true },
    { symbol: 'DAI', tokenIconSrc: '/icons/tokens/dai.svg', walletBalance: 128.5, apy: 2.31, canBeCollateral: false },
    {
      symbol: 'USDT',
      tokenIconSrc: '/icons/tokens/usdt.svg',
      walletBalance: 531.12,
      apy: 3.04,
      canBeCollateral: true,
    },
    { symbol: 'LINK', tokenIconSrc: '/icons/tokens/link.svg', walletBalance: 42, apy: 5.2, canBeCollateral: false },
    { symbol: 'MKR', tokenIconSrc: '/icons/tokens/mkr.svg', walletBalance: 1.5, apy: 6.71, canBeCollateral: true },
    {
      symbol: 'USDC',
      tokenIconSrc: '/icons/tokens/usdbc.svg',
      walletBalance: 2300,
      apy: 4.12,
      canBeCollateral: false,
    },
    {
      symbol: 'wstETH',
      tokenIconSrc: '/icons/tokens/wsteth.svg',
      walletBalance: 0.22,
      apy: 7.05,
      canBeCollateral: true,
    },
  ];

  const sortedRows = isSupply
    ? [...rows].sort((a, b) => {
        let diff = 0;
        switch (sortKey) {
          case 'assets':
            diff = a.symbol.localeCompare(b.symbol);
            break;
          case 'walletBalance':
            diff = a.walletBalance - b.walletBalance;
            break;
          case 'apy':
            diff = a.apy - b.apy;
            break;
        }
        return sortDirection === 'asc' ? diff : -diff;
      })
    : rows;

  const handleRequestSort = (key: SortKey) => {
    if (!isSupply) return;
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleSupply = (token: string, walletBalance: number) => {
    openModal(ModalType.SupplySuccess, { amount: walletBalance.toFixed(6), token });
  };

  const handleBorrow = () => {
    openModal(ModalType.Borrow, { token: 'K613', available: '5.67' });
  };

  return (
    <Paper isOpen={isOpen}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h6">{isSupply ? 'Assets to supply' : 'Assets to borrow'}</Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Select size="small" defaultValue="all">
            <MenuItem value="all">All categories</MenuItem>
          </Select>
          <Button variant="text" color="secondary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Hide –' : 'Show +'}
          </Button>
        </Stack>
      </Stack>

      {isAlertShown && (
        <Alert severity="warning" onClose={() => setIsAlertShown(false)}>
          {isSupply
            ? 'Your Ethereum wallet is empty. Purchase or transfer assets.'
            : 'To borrow you need to supply any asset to be used as collateral.'}
        </Alert>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              {isSupply ? (
                <TableSortLabel
                  active={sortKey === 'assets'}
                  direction={sortKey === 'assets' ? sortDirection : 'asc'}
                  onClick={() => handleRequestSort('assets')}
                >
                  Assets
                </TableSortLabel>
              ) : (
                'Assets'
              )}
            </TableCell>
            <TableCell align="right">
              {isSupply ? (
                <TableSortLabel
                  active={sortKey === 'walletBalance'}
                  direction={sortKey === 'walletBalance' ? sortDirection : 'asc'}
                  onClick={() => handleRequestSort('walletBalance')}
                >
                  Wallet Balance
                </TableSortLabel>
              ) : (
                'Available'
              )}
            </TableCell>
            <TableCell align="right">
              {isSupply ? (
                <TableSortLabel
                  active={sortKey === 'apy'}
                  direction={sortKey === 'apy' ? sortDirection : 'asc'}
                  onClick={() => handleRequestSort('apy')}
                >
                  APY
                </TableSortLabel>
              ) : (
                'APY, variable'
              )}
            </TableCell>
            {isSupply && <TableCell align="center">Can be collateral</TableCell>}
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedRows.map((row) => (
            <TableRow key={row.symbol}>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Image src={row.tokenIconSrc} width={24} height={24} alt={row.symbol} />
                  <Typography>{row.symbol}</Typography>
                </Stack>
              </TableCell>

              <TableCell align="right">{row.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</TableCell>
              <TableCell align="right">{row.apy.toFixed(2)}%</TableCell>

              {isSupply && (
                <TableCell align="center">
                  {row.canBeCollateral ? (
                    <Typography color="success.main">
                      <Check />
                    </Typography>
                  ) : null}
                </TableCell>
              )}

              <TableCell align="right">
                {isSupply ? (
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="contained"
                      color="inherit"
                      onClick={() => handleSupply(row.symbol, row.walletBalance)}
                    >
                      Supply
                    </Button>
                    <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                      <MoreHorizOutlined fontSize="small" />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button size="small" variant="contained" color="inherit" onClick={handleBorrow}>
                      Borrow
                    </Button>
                    <Button variant="text" size="small" color="secondary">
                      Details
                    </Button>
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem>Switch</MenuItem>
        <MenuItem>Details</MenuItem>
      </Menu>
    </Paper>
  );
}
