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
  SelectChangeEvent,
  ListItemText,
} from '@mui/material';
import React from 'react';

import { TokenIcon } from './primitives/TokenIcon';
import { FormattedNumber } from './primitives/FormattedNumber';
import { ChevronDownIcon } from '@heroicons/react/outline';

interface Asset {
  balance: string;
  symbol: string;
  address?: string;
}

export interface AssetInputProps<T extends Asset = Asset> {
  value: string;
  usdValue?: string;
  symbol: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onSelect?: (asset: T) => void;
  assets: T[];
}

export const AssetInput: React.FC<AssetInputProps> = ({
  value,
  // usdValue,
  symbol,
  onChange,
  disabled,
  onSelect,
  assets,
}) => {
  const validNumber = new RegExp(/^\d*\.?\d*$/); // allow only digits with decimals

  const onInputChange:
    | React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined = (event) => {
    if (validNumber.test(event.target.value)) {
      onChange(event.target.value);
    }
  };

  const handleSelect = (event: SelectChangeEvent) => {
    const newAsset = assets.find((asset) => asset.symbol === event.target.value) as Asset;
    onSelect && onSelect(newAsset);
  };

  const asset =
    assets.length === 1
      ? assets[0]
      : assets && (assets.find((asset) => asset.symbol === symbol) as Asset);

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
        {!onSelect ? (
          <>
            <TokenIcon symbol={symbol} sx={{ mx: '4px' }} />
            <Typography>{symbol}</Typography>
          </>
        ) : (
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <Select
              disabled={disabled}
              value={asset.symbol}
              onChange={handleSelect}
              variant="outlined"
              IconComponent={(props) => (
                <SvgIcon fontSize="medium" {...props}>
                  <ChevronDownIcon />
                </SvgIcon>
              )}
              renderValue={(symbol) => {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TokenIcon symbol={symbol} sx={{ mx: '4px' }} />
                    <Typography>{symbol}</Typography>
                  </Box>
                );
              }}
            >
              {assets.map((asset) => (
                <MenuItem key={asset.symbol} value={asset.symbol}>
                  <TokenIcon symbol={asset.symbol} sx={{ mx: '4px' }} />
                  <ListItemText sx={{ mr: '20px' }}>{asset.symbol}</ListItemText>
                  <FormattedNumber value={asset.balance} compact />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', pt: '4px' }}>
        <Typography sx={{ flexGrow: 1 }}>
          <FormattedNumber value={asset.balance} compact symbol="USD" />
        </Typography>
        <Typography>
          Balance <FormattedNumber value={asset.balance} compact />
        </Typography>
        <Button
          size="small"
          sx={{ minWidth: 0 }}
          onClick={() => onChange(asset.balance)}
          disabled={disabled}
        >
          <Trans>Max</Trans>
        </Button>
      </Box>
    </Box>
  );
};
