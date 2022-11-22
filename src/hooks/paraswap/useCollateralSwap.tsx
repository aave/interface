import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchExactInRate, MESSAGE_MAP, ParaSwapParams, SwapData, UseSwapProps } from './common';

interface UseSwapResponse {
  outputAmount: string;
  outputAmountUSD: string;
  inputAmount: string;
  inputAmountUSD: string;
  loading: boolean;
  error: string;
  paraswapParams: ParaSwapParams;
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
  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [outputAmountUSD, setOutputAmountUSD] = useState<string>('');
  const [inputAmountUSD, setInputAmountUSD] = useState<string>('');

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
    return fetchExactInRate(swapInData, swapOutData, chainId, userAddress, maxSlippage, max);
  }, [chainId, maxSlippage, swapInData, swapOutData, userAddress, max]);

  useEffect(() => {
    if (skip) return;

    const fetchRoute = async () => {
      if (!swapInData.underlyingAsset || !swapOutData.underlyingAsset) return;

      setLoading(true);

      try {
        const route = await exactInRate();

        setError('');
        setInputAmount(route.inputAmount);
        setOutputAmount(route.outputAmount);
        setInputAmountUSD(route.inputAmountUSD);
        setOutputAmountUSD(route.outputAmountUSD);
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
  }, [error, skip, swapInData.underlyingAsset, swapOutData.underlyingAsset, exactInRate]);

  return {
    outputAmount,
    outputAmountUSD,
    inputAmount,
    inputAmountUSD,
    loading,
    error,
    paraswapParams: {
      swapInData,
      swapOutData,
      chainId,
      userAddress,
      maxSlippage,
      swapVariant: 'exactIn',
      max,
    }, // Used for calling paraswap buildTx as very last step in transaction
  };
};
