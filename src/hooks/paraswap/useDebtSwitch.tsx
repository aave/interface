import { BigNumberZeroDecimal, normalize } from '@aave/math-utils';
import { OptimalRate } from '@paraswap/sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchExactOutRate,
  fetchExactOutTxParams,
  MESSAGE_MAP,
  SwapData,
  SwapTransactionParams,
  UseSwapProps,
} from './common';

interface UseDebtSwitchResponse {
  outputAmount: string;
  outputAmountUSD: string;
  inputAmount: string;
  inputAmountUSD: string;
  loading: boolean;
  error: string;
  buildTxFn: () => Promise<SwapTransactionParams>;
}

export const useDebtSwitch = ({
  chainId,
  max,
  maxSlippage,
  skip,
  swapIn,
  swapOut,
  userAddress,
}: UseSwapProps): UseDebtSwitchResponse => {
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [inputAmountUSD, setInputAmountUSD] = useState<string>('0');
  const [outputAmount, setOutputAmount] = useState<string>('0');
  const [outputAmountUSD, setOutputAmountUSD] = useState<string>('0');
  const [route, setRoute] = useState<OptimalRate>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setInputAmountUSD('0');
        setOutputAmount('0');
        setOutputAmountUSD('0');
        setRoute(undefined);
        return;
      }

      setLoading(true);

      try {
        const route: OptimalRate = await exactOutRate();

        setError('');
        setRoute(route);

        const srcAmount = new BigNumberZeroDecimal(route.srcAmount)
          .multipliedBy(1 - maxSlippage / 100)
          .toFixed(0);

        setInputAmount(normalize(srcAmount, route.srcDecimals));
        setOutputAmount(normalize(route.destAmount, route.destDecimals));

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

    return () => {
      clearTimeout(timeout);
    };
  }, [
    skip,
    swapInData.underlyingAsset,
    swapInData.amount,
    swapOutData.underlyingAsset,
    swapOutData.amount,
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
      return fetchExactOutTxParams(route, swapIn, swapOut, chainId, userAddress, maxSlippage);
    },
  };
};
