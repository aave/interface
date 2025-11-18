import { BigNumberValue, valueToBigNumber } from '@aave/math-utils';
import { ExclamationIcon, RefreshIcon } from '@heroicons/react/outline';
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
  originAssetAmount: string;
  targetAssetAmount: string;
  originAssetAmountUSD: string;
  targetAssetAmountUSD: string;
  originAsset: SwappableToken;
  targetAsset: SwappableToken;
  disabled?: boolean;
  handleRateChange: (rateFromAsset: SwappableToken, newRate: BigNumberValue) => void;
}

export const PriceInput = ({
  originAssetAmount,
  targetAssetAmount,
  originAssetAmountUSD,
  targetAssetAmountUSD,
  loading = false,
  originAsset,
  targetAsset,
  disabled = false,
  handleRateChange: handleInputsAmountsChange,
}: AssetInputProps) => {
  const DEBOUNCE_MS = 300;
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
    baseSymbol?: string;
    quoteSymbol?: string;
  }>({
    nominal: undefined,
    usd: undefined,
    baseSymbol: undefined,
    quoteSymbol: undefined,
  });
  const rateDebounceRef = useRef<number | undefined>(undefined);

  const [amount, setAmount] = useState<{
    originAmount?: BigNumber;
    targetAmount?: BigNumber;
    originAmountUsd?: BigNumber;
    targetAmountUsd?: BigNumber;
  }>({
    originAmount: undefined,
    targetAmount: undefined,
    originAmountUsd: undefined,
    targetAmountUsd: undefined,
  });

  useEffect(() => {
    if (!originAssetAmount || !targetAssetAmount) return;

    setAmount({
      originAmount: valueToBigNumber(originAssetAmount),
      targetAmount: valueToBigNumber(targetAssetAmount),
      originAmountUsd: valueToBigNumber(originAssetAmountUSD),
      targetAmountUsd: valueToBigNumber(targetAssetAmountUSD),
    });
  }, [originAssetAmount, targetAssetAmount, originAssetAmountUSD, targetAssetAmountUSD]);

  useEffect(() => {
    if (
      !amount.originAmount?.gt(0) ||
      !amount.targetAmount?.gt(0) ||
      !amount.originAmountUsd?.gt(0) ||
      !amount.targetAmountUsd?.gt(0)
    )
      return;

    // Define rate in the direction currently displayed:
    // "When 1 {fromAsset} is worth ..." so nominal shows quote units per 1 base (fromAsset).
    const showingOriginAsBase = fromAsset.addressToSwap === originAsset.addressToSwap;
    const nextNominal = showingOriginAsBase
      ? amount.targetAmount && amount.originAmount
        ? amount.targetAmount.div(amount.originAmount)
        : undefined
      : amount.originAmount && amount.targetAmount
      ? amount.originAmount.div(amount.targetAmount)
      : undefined;

    const nextUsd = showingOriginAsBase
      ? amount.targetAmountUsd && amount.originAmountUsd
        ? amount.targetAmountUsd.div(amount.originAmountUsd)
        : undefined
      : amount.originAmountUsd && amount.targetAmountUsd
      ? amount.originAmountUsd.div(amount.targetAmountUsd)
      : undefined;

    setRate({
      nominal: nextNominal,
      usd: nextUsd,
    });

    // Capture latest market rate from the most recent quote only once
    if (lastMarketRate.nominal === undefined) {
      setLastMarketRate({
        nominal: nextNominal,
        usd: nextUsd,
        baseSymbol: fromAsset.symbol,
        quoteSymbol: toAsset.symbol,
      });
    }
  }, [
    amount.originAmount,
    amount.targetAmount,
    amount.originAmountUsd,
    amount.targetAmountUsd,
    fromAsset.addressToSwap,
    originAsset.addressToSwap,
  ]);

  useEffect(() => {
    setFromAsset(originAsset);
    setToAsset(targetAsset);
    setRate({
      nominal: undefined,
      usd: undefined,
    });
    setLastMarketRate({
      nominal: undefined,
      usd: undefined,
    });
    setAmount({
      originAmount: undefined,
      targetAmount: undefined,
      originAmountUsd: undefined,
      targetAmountUsd: undefined,
    });
  }, [originAsset, targetAsset]);

  const setNewRate = (newRate: BigNumberValue) => {
    const nextNominal = valueToBigNumber(newRate);
    // Prefer using existing usd-to-nominal ratio K = rate.usd / rate.nominal
    let kRatio: BigNumber | undefined = undefined;
    if (rate.nominal && !rate.nominal.isZero() && rate.usd) {
      kRatio = rate.usd.div(rate.nominal);
    } else if (
      amount.targetAmountUsd &&
      amount.originAmountUsd &&
      amount.targetAmount &&
      amount.originAmount &&
      !amount.targetAmount.isZero() &&
      !amount.originAmount.isZero()
    ) {
      // Fallback: K = (toUSD/to) / (fromUSD/from) = (toUSD * from) / (fromUSD * to)
      kRatio = amount.targetAmountUsd
        .times(amount.originAmount)
        .div(amount.originAmountUsd.times(amount.targetAmount));
    }

    const nextUsd = kRatio ? nextNominal.times(kRatio) : valueToBigNumber(0);

    setRate({
      nominal: nextNominal,
      usd: nextUsd,
    });
  };

  // Debounced emitter to upstream handler
  const emitRateChangeDebounced = (baseToken: SwappableToken, newRate: BigNumber) => {
    if (rateDebounceRef.current !== undefined) {
      window.clearTimeout(rateDebounceRef.current);
    }
    rateDebounceRef.current = window.setTimeout(() => {
      handleInputsAmountsChange(baseToken, newRate);
      setNewRate(newRate);
    }, DEBOUNCE_MS) as unknown as number;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rateDebounceRef.current !== undefined) {
        window.clearTimeout(rateDebounceRef.current);
      }
    };
  }, []);

  const handleSwitchRateDirection = () => {
    // Also invert the stored market reference rate so the Market button uses the correct direction
    setLastMarketRate((prev) => {
      const invNominal =
        prev.nominal && !prev.nominal.isZero()
          ? valueToBigNumber(1).div(prev.nominal)
          : prev.nominal;
      const invUsd = prev.usd && !prev.usd.isZero() ? valueToBigNumber(1).div(prev.usd) : prev.usd;
      return {
        nominal: invNominal,
        usd: invUsd,
        baseSymbol: prev.quoteSymbol ?? toAssetAux.symbol,
        quoteSymbol: prev.baseSymbol ?? fromAssetAux.symbol,
      };
    });

    setRate({
      nominal: rate.nominal ? valueToBigNumber(1).div(rate.nominal) : undefined,
      usd: rate.usd ? valueToBigNumber(1).div(rate.usd) : undefined,
    });

    const fromAssetAux = fromAsset;
    const toAssetAux = toAsset;
    setFromAsset(toAssetAux);
    setToAsset(fromAssetAux);
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
              const bn = valueToBigNumber(typed);
              setNewRate(bn);
              emitRateChangeDebounced(fromAsset, bn);
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
            sx={{ mr: 2, ml: 1, fontSize: '24px' }}
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
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: 'background.paper',
              ml: 1,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'background.surface',
              },
              '&:hover .refresh-spin': {
                transform: 'rotate(360deg)',
              },
            }}
          >
            <SvgIcon
              className="refresh-spin"
              sx={{
                fontSize: 14,
                transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <RefreshIcon />
            </SvgIcon>
          </Box>
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
            value={lastMarketRate.nominal ? lastMarketRate.nominal.toNumber() : 0}
            compact
            variant="secondary12"
            color="text.secondary"
            symbolsColor="text.disabled"
            sx={{ ml: 1 }}
          />
        </Typography>
        <Button
          size="small"
          sx={{ minWidth: 0, ml: '7px', py: 0, px: 1 }}
          onClick={() => {
            const marketNominal = lastMarketRate.nominal ? lastMarketRate.nominal.toString() : '0';
            setNewRate(valueToBigNumber(marketNominal));
            // Honor the stored base direction for the market rate
            const baseToken = lastMarketRate.baseSymbol === fromAsset.symbol ? fromAsset : toAsset;
            handleInputsAmountsChange(baseToken, valueToBigNumber(marketNominal));
          }}
          disabled={disabled}
        >
          Market
        </Button>
      </Box>
    </Box>
  );
};
