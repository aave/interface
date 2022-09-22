import { Box, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import * as React from 'react';

import { TokenIcon } from '../../primitives/TokenIcon';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export type DelegationToken = { address: string; name: string; amount: string; symbol: string };

export type DelegationTokenSelectorProps = {
  delegationTokens: DelegationToken[];
  setDelegationToken: (token: string) => void;
  delegationTokenAddress: string;
};

export const DelegationTokenSelector = ({
  delegationTokens,
  setDelegationToken,
  delegationTokenAddress,
}: DelegationTokenSelectorProps) => {
  return (
    <FormControl variant="standard" fullWidth sx={{ mb: 6 }}>
      <Select
        fullWidth
        value={delegationTokenAddress}
        onChange={(e) => setDelegationToken(e.target.value)}
        input={<OutlinedInput />}
        MenuProps={MenuProps}
        native={false}
        displayEmpty
        sx={{
          '& .MuiSvgIcon-root': {
            right: '12px',
          },
        }}
        renderValue={(selectedToken) => {
          if (!selectedToken)
            return (
              <Box sx={{ display: 'flex', flexDirection: 'row', pr: '12px' }}>
                <Typography variant="buttonM">Select ...</Typography>
              </Box>
            );
          const token = delegationTokens.find(
            (token) => token.address === delegationTokenAddress
          ) as DelegationToken;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', pr: '12px' }}>
              <TokenIcon symbol={token.symbol} />
              <Typography variant="buttonM" sx={{ ml: 2, flexGrow: 1 }}>
                {token.name}
              </Typography>
              <Typography variant="buttonM">{token.amount}</Typography>
            </Box>
          );
        }}
      >
        {delegationTokens.map((token) => (
          <MenuItem
            key={`delegation-token-${token.address}`}
            value={token.address}
            disabled={token.amount === '0'}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
              <TokenIcon symbol={token.symbol} sx={{ mx: '4px' }} />
              <Typography variant="buttonM" sx={{ ml: 2, flexGrow: 1 }}>
                {token.name}
              </Typography>
              <Typography variant="buttonM">{token.amount}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
