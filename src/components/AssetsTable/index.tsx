import { Check, MoreHorizOutlined } from '@mui/icons-material';
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Paper } from './styles';

export default function AssetsTable({ type }: { type: 'supply' | 'borrow' }) {
  const isSupply = type === 'supply';

  const [isOpen, setIsOpen] = useState<boolean>(true);

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

      <Alert severity="warning">
        {isSupply
          ? 'Your Ethereum wallet is empty. Purchase or transfer assets.'
          : 'To borrow you need to supply any asset to be used as collateral.'}
      </Alert>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Assets</TableCell>
            <TableCell align="right">{isSupply ? 'Wallet Balance' : 'Available'}</TableCell>
            <TableCell align="right">{isSupply ? 'APY' : 'APY, variable'}</TableCell>
            {isSupply && <TableCell align="center">Can be collateral</TableCell>}
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {Array.from({ length: 7 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Image src="/icons/networks/ethereum.svg" width={24} height={24} alt="eth" />
                  <Typography>ETH</Typography>
                </Stack>
              </TableCell>

              <TableCell align="right">0</TableCell>
              <TableCell align="right">1.86%</TableCell>

              {isSupply && (
                <TableCell align="center">
                  <Typography color="success.main">
                    <Check />
                  </Typography>
                </TableCell>
              )}

              <TableCell align="right">
                {isSupply ? (
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="contained" color="inherit">
                      Supply
                    </Button>
                    <IconButton size="small">
                      <MoreHorizOutlined fontSize="small" />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button size="small" variant="contained" color="inherit">
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
    </Paper>
  );
}
