import { ExclamationIcon } from '@heroicons/react/outline';
import { Box, Button, CircularProgress, InputBase, SvgIcon, Typography } from '@mui/material';
import React, { useRef } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { StaticRate } from 'src/hooks/useStaticRate';

import { FormattedNumber } from '../../primitives/FormattedNumber';
import { ExternalTokenIcon } from '../../primitives/TokenIcon';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: string;
}

export const NumberFormatCustom = React.forwardRef<NumberFormatProps, CustomProps>(
  function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          if (values.value !== props.value)
            onChange({
              target: {
                name: props.name,
                value: values.value || '',
              },
            });
        }}
        thousandSeparator
        isNumericString
        allowNegative={false}
      />
    );
  }
);

export interface AssetInputProps {
  loading?: boolean;
  originalRate?: StaticRate;
  rate: string;
  rateUsd: string;
  originAsset: TokenInfoWithBalance;
  targetAsset: TokenInfoWithBalance;
  disabled?: boolean;
  onChangeRate: (newRate: string) => void;
  isInvertedRate: boolean;
  setIsInvertedRate: (isInverted: boolean) => void;
}

export const PriceInput = ({
  loading = false,
  rate,
  rateUsd,
  originAsset,
  targetAsset,
  originalRate,
  onChangeRate,
  disabled = false,
  isInvertedRate,
  setIsInvertedRate,
}: AssetInputProps) => {
  const inputRef = useRef<HTMLDivElement>(null);

  const handleRateSwith = () => {
    setIsInvertedRate(!isInvertedRate);
    onChangeRate((Number(rate) === 0 ? 0 : 1 / Number(rate)).toString());
  };

  const marketRate = originalRate
    ? isInvertedRate
      ? (1 / Number(originalRate.rate)).toString()
      : originalRate.rate
    : rate;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography color="text.secondary">
        When 1 {isInvertedRate ? targetAsset.symbol : originAsset.symbol} is worth:
      </Typography>
      <Box
        ref={inputRef}
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          overflow: 'hidden',
          px: 3,
          py: 2,
          width: '100%',
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {loading ? (
            <Box sx={{ flex: 1 }}>
              <CircularProgress color="inherit" size="16px" />
            </Box>
          ) : (
            <InputBase
              sx={{ flex: 1 }}
              placeholder="0.00"
              value={rate}
              autoFocus
              disabled={disabled}
              inputProps={{
                'aria-label': 'amount input',
                style: {
                  width: '100%',
                  fontSize: '21px',
                  lineHeight: '28,01px',
                  padding: 0,
                  height: '28px',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                },
              }}
              // eslint-disable-next-line
              inputComponent={NumberFormatCustom as any}
              onChange={(e) => {
                onChangeRate(e.target.value);
              }}
            />
          )}

          <Button
            disableRipple
            onClick={() => handleRateSwith()}
            data-cy={`assetSelect`}
            sx={{
              p: 0,
              borderRadius: '6px',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <ExternalTokenIcon
              symbol={isInvertedRate ? originAsset.symbol : targetAsset.symbol}
              logoURI={isInvertedRate ? originAsset.logoURI : targetAsset.logoURI}
              sx={{ mr: 2, ml: 3, fontSize: '24px' }}
            />
            <Typography
              data-cy={`assetsSelectedOption_${
                isInvertedRate ? originAsset.symbol.toUpperCase() : targetAsset.symbol.toUpperCase()
              }`}
              variant="main16"
              color="text.primary"
              sx={{ fontWeight: 500 }}
            >
              {isInvertedRate ? originAsset.symbol : targetAsset.symbol}
            </Typography>
            {targetAsset.extensions?.isUserCustom && (
              <SvgIcon sx={{ fontSize: 16, ml: 1 }} color="warning">
                <ExclamationIcon />
              </SvgIcon>
            )}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', height: '20px', mt: 0.5 }}>
          {loading ? (
            <Box sx={{ flex: 1 }} />
          ) : (
            <FormattedNumber
              value={rateUsd}
              compact
              symbol="USD"
              variant="secondary12"
              color="text.muted"
              symbolsColor="text.muted"
              flexGrow={1}
            />
          )}

          <Typography component="div" variant="secondary12" color="text.secondary">
            <FormattedNumber
              value={marketRate}
              compact
              variant="secondary12"
              color="text.secondary"
              symbolsColor="text.disabled"
              sx={{ ml: 1 }}
            />
          </Typography>
          <Button
            size="small"
            sx={{ minWidth: 0, ml: '7px', p: 0 }}
            onClick={() => {
              onChangeRate(marketRate);
            }}
            disabled={disabled}
          >
            Market
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
