import { BigNumberZeroDecimal, normalize } from '@aave/math-utils';
import { OptimalRate } from 'paraswap-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchExactInRate,
  fetchExactInTxParams,
  fetchExactOutRate,
  fetchExactOutTxParams,
  MESSAGE_MAP,
  SwapData,
  SwapTransactionParams,
  SwapVariant,
  UseSwapProps,
} from './common';

type UseRepayWithCollateralProps = UseSwapProps & {
  swapVariant: SwapVariant;
};

interface UseRepayWithCollateralResponse {
  outputAmount: string;
  outputAmountUSD: string;
  inputAmount: string;
  inputAmountUSD: string;
  loading: boolean;
  error: string;
  buildTxFn: () => Promise<SwapTransactionParams>;
}

export const useCollateralRepaySwap = ({
  chainId,
  max,
  maxSlippage,
  skip,
  swapIn,
  swapOut,
  userAddress,
  swapVariant,
}: UseRepayWithCollateralProps): UseRepayWithCollateralResponse => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [outputAmount, setOutputAmount] = useState<string>('0');
  const [outputAmountUSD, setOutputAmountUSD] = useState<string>('0');
  const [inputAmountUSD, setInputAmountUSD] = useState<string>('0');
  const [route, setRoute] = useState<OptimalRate>();

  const swapInData = useMemo(() => {
    const swapData: SwapData = {
      underlyingAsset: swapIn.underlyingAsset,
      decimals: swapIn.decimals,
      supplyAPY: swapIn.supplyAPY,
      amount: swapIn.amount,
      variableBorrowAPY: swapIn.variableBorrowAPY,
    };
    return swapData;
  }, [
    swapIn.amount,
    swapIn.decimals,
    swapIn.supplyAPY,
    swapIn.underlyingAsset,
    swapIn.variableBorrowAPY,
  ]);

  const swapOutData = useMemo(() => {
    const swapData: SwapData = {
      underlyingAsset: swapOut.underlyingAsset,
      decimals: swapOut.decimals,
      supplyAPY: swapOut.supplyAPY,
      amount: swapOut.amount,
      variableBorrowAPY: swapOut.variableBorrowAPY,
    };
    return swapData;
  }, [
    swapOut.amount,
    swapOut.decimals,
    swapOut.supplyAPY,
    swapOut.underlyingAsset,
    swapOut.variableBorrowAPY,
  ]);

  const exactInRate = useCallback(() => {
    return fetchExactInRate(swapInData, swapOutData, chainId, userAddress);
  }, [chainId, swapInData, swapOutData, userAddress]);

  const exactOutRate = useCallback(
    () => fetchExactOutRate(swapInData, swapOutData, chainId, userAddress, max),
    [chainId, max, swapInData, swapOutData, userAddress]
  );

  useEffect(() => {
    if (skip) return;

    const fetchRoute = async () => {
      if (
        !swapInData.underlyingAsset ||
        !swapOutData.underlyingAsset ||
        !swapOutData.amount ||
        swapOutData.amount === '0' ||
        isNaN(+swapOutData.amount)
      ) {
        setInputAmount('0');
        setOutputAmount('0');
        setOutputAmountUSD('0');
        setInputAmountUSD('0');
        setRoute(undefined);
        return;
      }

      setLoading(true);

      try {
        let route: OptimalRate | undefined;
        if (swapVariant === 'exactIn') {
          route = await exactInRate();
        } else {
          route = await exactOutRate();
        }

        setError('');
        setRoute(route);

        if (swapVariant === 'exactIn') {
          const minAmount = new BigNumberZeroDecimal(route.destAmount)
            .multipliedBy(1 - maxSlippage / 100)
            .toFixed(0);
          setInputAmount(normalize(route.srcAmount, route.srcDecimals));
          setOutputAmount(normalize(minAmount, route.destDecimals));
        } else {
          const srcAmount = new BigNumberZeroDecimal(route.srcAmount)
            .multipliedBy(1 - maxSlippage / 100)
            .toFixed(0);

          setInputAmount(normalize(srcAmount, route.srcDecimals));
          setOutputAmount(normalize(route.destAmount, route.destDecimals));
        }

        setInputAmountUSD(route.srcUSD);
        setOutputAmountUSD(route.destUSD);
      } catch (e) {
        console.error(e);
        const message = MESSAGE_MAP[e.message] || 'There was an issue fetching data from Paraswap';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    // Update the transaction on any dependency change
    const timeout = setTimeout(() => {
      fetchRoute();
    }, 400);

    // If there are no dependency changes, refresh every 15 seconds
    const interval = setInterval(
      () => {
        fetchRoute();
      },
      error ? 3000 : 15000
    );

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [
    error,
    skip,
    swapVariant,
    swapInData.underlyingAsset,
    swapOutData.underlyingAsset,
    swapOutData.amount,
    exactInRate,
    exactOutRate,
    maxSlippage,
  ]);

  return {
    outputAmount,
    outputAmountUSD,
    inputAmount,
    inputAmountUSD,
    loading,
    error,
    // Used for calling paraswap buildTx as very last step in transaction
    buildTxFn: async () => {
      if (!route) throw new Error('Route required to build transaction');
      if (swapVariant === 'exactIn') {
        return fetchExactInTxParams(route, swapIn, swapOut, chainId, userAddress, maxSlippage);
      } else {
        return fetchExactOutTxParams(route, swapIn, swapOut, chainId, userAddress, maxSlippage);
      }
    },
  };
};
