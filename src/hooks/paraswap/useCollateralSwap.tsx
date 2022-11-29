import { BigNumberZeroDecimal, normalize } from '@aave/math-utils';
import { OptimalRate } from 'paraswap-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchExactInRate,
  fetchExactInTxParams,
  MESSAGE_MAP,
  SwapData,
  SwapTransactionParams,
  UseSwapProps,
} from './common';

interface UseSwapResponse {
  outputAmount: string;
  outputAmountUSD: string;
  inputAmount: string;
  inputAmountUSD: string;
  loading: boolean;
  error: string;
  buildTxFn: () => Promise<SwapTransactionParams>;
}

export const useCollateralSwap = ({
  swapIn,
  swapOut,
  userAddress,
  max,
  chainId,
  skip,
  maxSlippage,
}: UseSwapProps): UseSwapResponse => {
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
    return fetchExactInRate(swapInData, swapOutData, chainId, userAddress, max);
  }, [chainId, swapInData, swapOutData, userAddress, max]);

  useEffect(() => {
    if (skip) return;

    const fetchRoute = async () => {
      if (
        !swapInData.underlyingAsset ||
        !swapOutData.underlyingAsset ||
        !swapInData.amount ||
        swapInData.amount === '0' ||
        isNaN(+swapInData.amount)
      ) {
        return;
      }

      setLoading(true);

      try {
        const route = await exactInRate();
        setError('');
        setRoute(route);
        setInputAmount(normalize(route.srcAmount, route.srcDecimals));

        const minAmount = new BigNumberZeroDecimal(route.destAmount)
          .multipliedBy(1 - maxSlippage / 100)
          .toFixed(0);

        setOutputAmount(normalize(minAmount, route.destDecimals));
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
    swapInData.underlyingAsset,
    swapOutData.underlyingAsset,
    exactInRate,
    maxSlippage,
    swapInData.amount,
    userAddress,
    max,
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
      return fetchExactInTxParams(route, swapIn, swapOut, chainId, userAddress, maxSlippage);
    },
  };
};
