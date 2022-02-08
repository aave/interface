import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Typography,
  InputBase,
  FormControl,
  Select,
  MenuItem,
  SvgIcon,
} from '@mui/material';
import React from 'react';

import { TokenIcon } from './primitives/TokenIcon';
import { FormattedNumber } from './primitives/FormattedNumber';
import { ChevronDownIcon } from '@heroicons/react/outline';

export interface AssetInputProps {
  value: string;
  usdValue?: string;
  balance: string;
  symbol: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onSelect?: (asset: string) => void;
}

export const AssetInput: React.FC<AssetInputProps> = ({
  value,
  // usdValue,
  balance,
  symbol,
  onChange,
  disabled,
  onSelect,
}) => {
  const validNumber = new RegExp(/^\d*\.?\d*$/); // allow only digits with decimals

  const onInputChange:
    | React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined = (event) => {
    if (validNumber.test(event.target.value)) {
      onChange(event.target.value);
    }
  };

  return (
    <Box sx={{ p: '8px 12px', border: '1px solid #E0E5EA', borderRadius: '6px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <InputBase
          sx={{ flex: 1 }}
          placeholder="0.00"
          onChange={onInputChange}
          disabled={disabled}
          value={value}
          inputProps={{
            inputMode: 'numeric',
            'aria-label': 'amount input',
            style: {
              fontSize: '21px',
            },
          }}
        />
        {onSelect ? (
          <>
            <TokenIcon symbol={symbol} sx={{ mx: '4px' }} />
            <Typography>{symbol}</Typography>
          </>
        ) : (
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <Select
              value={10}
              onChange={onSelect}
              variant="outlined"
              IconComponent={(props) => (
                <SvgIcon fontSize="medium" {...props}>
                  <ChevronDownIcon />
                </SvgIcon>
              )}
              renderValue={(asset) => {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TokenIcon symbol={symbol} sx={{ mx: '4px' }} />
                    <Typography>{symbol}</Typography>
                  </Box>
                );
              }}
            >
              <MenuItem value={10}>
                <SvgIcon fontSize="medium">
                  <ChevronDownIcon />
                </SvgIcon>
                Ten
              </MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', pt: '4px' }}>
        <Typography sx={{ flexGrow: 1 }}>
          <FormattedNumber value={balance} compact symbol="USD" />
        </Typography>
        <Typography>
          Balance <FormattedNumber value={balance} compact />
        </Typography>
        <Button size="small" sx={{ minWidth: 0 }} onClick={() => onChange(balance)}>
          <Trans>Max</Trans>
        </Button>
      </Box>
    </Box>
  );
};
