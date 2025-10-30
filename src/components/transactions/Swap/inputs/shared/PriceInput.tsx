import { BigNumberValue, valueToBigNumber } from '@aave/math-utils';
import { ExclamationIcon } from '@heroicons/react/outline';
import { Box, Button, CircularProgress, InputBase, SvgIcon, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import React, { useEffect, useRef, useState } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';

import { SwappableToken, TokenType } from '../../types';

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
        // isNumericString
        allowNegative={false}
      />
    );
  }
);

export interface AssetInputProps {
  loading?: boolean;
  inputAmount: string;
  outputAmount: string;
  inputAmountUSD: string;
  outputAmountUSD: string;
  originAsset: SwappableToken;
  targetAsset: SwappableToken;
  disabled?: boolean;
  handleRateChange: (rateFromAsset: SwappableToken, newRate: BigNumberValue) => void;
}

export const PriceInput = ({
  inputAmount,
  outputAmount,
  inputAmountUSD,
  outputAmountUSD,
  loading = false,
  originAsset,
  targetAsset,
  disabled = false,
  handleRateChange: handleInputsAmountsChange,
}: AssetInputProps) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const [fromAsset, setFromAsset] = useState<SwappableToken>(originAsset);
  const [toAsset, setToAsset] = useState<SwappableToken>(targetAsset);
  const [rate, setRate] = useState<{
    nominal?: BigNumber;
    usd?: BigNumber;
  }>({
    nominal: undefined,
    usd: undefined,
  });

  const [lastMarketRate, setLastMarketRate] = useState<{
    nominal?: BigNumber;
    usd?: BigNumber;
  }>({
    nominal: undefined,
    usd: undefined,
  });

  const [amount, setAmount] = useState<{
    fromAmount?: BigNumber;
    toAmount?: BigNumber;
    fromAmountUsd?: BigNumber;
    toAmountUsd?: BigNumber;
  }>({
    fromAmount: undefined,
    toAmount: undefined,
    fromAmountUsd: undefined,
    toAmountUsd: undefined,
  });

  useEffect(() => {
    if (!inputAmount || !outputAmount) return;

    setAmount({
      fromAmount: valueToBigNumber(inputAmount),
      toAmount: valueToBigNumber(outputAmount),
      fromAmountUsd: valueToBigNumber(inputAmountUSD),
      toAmountUsd: valueToBigNumber(outputAmountUSD),
    });
  }, [inputAmount, outputAmount, inputAmountUSD, outputAmountUSD]);

  useEffect(() => {
    const rate =
      amount.toAmount && amount.fromAmount ? amount.toAmount.div(amount.fromAmount) : undefined;
    const rateUsd =
      amount.toAmountUsd && amount.fromAmountUsd
        ? amount.toAmountUsd.div(amount.fromAmountUsd)
        : undefined;

    setRate({
      nominal: rate,
      usd: rateUsd,
    });

    // Capture latest market rate from the most recent quote (or direction switch)
    setLastMarketRate({
      nominal: rate,
      usd: rateUsd,
    });
  }, [amount]);

  const setNewRate = (newRate: BigNumberValue) => {
    const nextNominal = valueToBigNumber(newRate);
    // Prefer using existing usd-to-nominal ratio K = rate.usd / rate.nominal
    let kRatio: BigNumber | undefined = undefined;
    if (rate.nominal && !rate.nominal.isZero() && rate.usd) {
      kRatio = rate.usd.div(rate.nominal);
    } else if (
      amount.toAmountUsd &&
      amount.fromAmountUsd &&
      amount.toAmount &&
      amount.fromAmount &&
      !amount.toAmount.isZero() &&
      !amount.fromAmount.isZero()
    ) {
      // Fallback: K = (toUSD/to) / (fromUSD/from) = (toUSD * from) / (fromUSD * to)
      kRatio = amount.toAmountUsd
        .times(amount.fromAmount)
        .div(amount.fromAmountUsd.times(amount.toAmount));
    }

    const nextUsd = kRatio ? nextNominal.times(kRatio) : valueToBigNumber(0);

    setRate({
      nominal: nextNominal,
      usd: nextUsd,
    });
  };

  const handleSwitchRateDirection = () => {
    const fromAssetAux = fromAsset;
    const toAssetAux = toAsset;
    setFromAsset(toAssetAux);
    setToAsset(fromAssetAux);

    const fromAmount = amount.fromAmount;
    const fromAmountUsd = amount.fromAmountUsd;
    const toAmount = amount.toAmount;
    const toAmountUsd = amount.toAmountUsd;
    setAmount({
      fromAmount: toAmount,
      fromAmountUsd: toAmountUsd,
      toAmount: fromAmount,
      toAmountUsd: fromAmountUsd,
    });
  };

  return (
    <Box
      ref={inputRef}
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '6px',
        overflow: 'hidden',
        px: 3,
        py: 2,
        width: '100%',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: 'background.surface',
        },
      })}
    >
      <Typography variant="secondary12" color="text.muted">
        When 1 {fromAsset.symbol} is worth:
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <Box sx={{ flex: 1 }}>
            <CircularProgress color="inherit" size="16px" />
          </Box>
        ) : (
          <InputBase
            sx={{ flex: 1 }}
            placeholder="0.00"
            value={rate.nominal ? rate.nominal.toString(10) : ''}
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
              const typed = e.target.value;
              setNewRate(typed);
              handleInputsAmountsChange(fromAsset, valueToBigNumber(typed));
            }}
          />
        )}

        <Button
          disableRipple
          onClick={handleSwitchRateDirection}
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
            symbol={toAsset.symbol}
            logoURI={toAsset.logoURI}
            sx={{ mr: 2, ml: 3, fontSize: '24px' }}
          />
          <Typography
            data-cy={`assetsSelectedOption_${toAsset.symbol.toUpperCase()}`}
            variant="main16"
            color="text.primary"
            sx={{ fontWeight: 500 }}
          >
            {toAsset.symbol}
          </Typography>
          {toAsset.tokenType === TokenType.USER_CUSTOM && (
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
            value={rate.usd ? rate.usd.toString() : 0}
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
            value={rate.nominal ? rate.nominal.toNumber() : 0}
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
            const marketNominal = lastMarketRate.nominal ? lastMarketRate.nominal.toString() : '0';
            setNewRate(marketNominal);
            // Rate expresses how many toAsset units per 1 fromAsset, so pass fromAsset as the base
            handleInputsAmountsChange(fromAsset, valueToBigNumber(marketNominal));
          }}
          disabled={disabled}
        >
          Market
        </Button>
      </Box>
    </Box>
  );
};
