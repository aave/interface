import { Trans } from '@lingui/macro';
import { Box, Button, InputAdornment, TextField, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import React from 'react';

import { TokenIcon } from './primitives/TokenIcon';

export interface AssetInputProps {
  value: string;
  usdValue: string;
  balance: string;
  symbol: string;
  onChange: (value: string) => void;
  sx: SxProps;
  disabled?: boolean;
}

export const AssetInput: React.FC<AssetInputProps> = ({
  value,
  usdValue,
  balance,
  symbol,
  onChange,
  disabled,
  sx,
}) => {
  const usdValueFormat = `${usdValue} USD`;

  const setMaxBalance = () => {
    onChange(balance);
  };

  const onInputChange:
    | React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined = (event) => {
    onChange(event.target.value);
  };

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="description">
          <Trans>Amount</Trans>
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <Typography variant="description" sx={{ marginRight: '2px' }}>
            <Trans>Available</Trans>
          </Typography>
          <Typography variant="secondary14">{balance}</Typography>
        </Box>
      </Box>
      <TextField
        // helperText={usdValueFormat}
        onChange={onInputChange}
        value={value}
        autoFocus
        fullWidth
        disabled={disabled}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <TokenIcon symbol={symbol} sx={{ width: 32, height: 32 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Button
                variant="outlined"
                sx={{ width: 53, height: 32, textTransform: 'none', fontWeight: '600' }}
                onClick={setMaxBalance}
              >
                <Trans>Max</Trans>
              </Button>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
