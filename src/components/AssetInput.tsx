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
}

export const AssetInput: React.FC<AssetInputProps> = ({
  value,
  usdValue,
  balance,
  symbol,
  onChange,
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
        <Trans>Amount</Trans>
        <Typography>
          <Trans>Balance</Trans> <b>{balance}</b>
        </Typography>
      </Box>
      <TextField
        id="outlined-basic"
        variant="outlined"
        color="primary"
        helperText={usdValueFormat}
        onChange={onInputChange}
        value={value}
        autoFocus
        fullWidth
        sx={{
          fontSize: '1.5rem',
        }}
        FormHelperTextProps={{
          style: {
            marginTop: 4,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            fontSize: '0.75rem',
          },
        }}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        InputProps={{
          style: {
            fontSize: '1.5rem',
          },
          startAdornment: (
            <InputAdornment position="start">
              <TokenIcon symbol={symbol} sx={{ width: 28, height: 28 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Button
                variant="outlined"
                color="secondary"
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
