import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchExactInTxParams, MESSAGE_MAP, SwapData, UseSwapProps } from './common';

export const useCollateralSwap = ({
  swapIn,
  swapOut,
  userAddress,
  max,
  chainId,
  skip,
  maxSlippage,
}: UseSwapProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [swapCallData, setSwapCallData] = useState<string>('');
  const [augustus, setAugustus] = useState<string>('');
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

  const exactInTx = useCallback(() => {
    return fetchExactInTxParams(swapInData, swapOutData, chainId, userAddress, maxSlippage, max);
  }, [chainId, maxSlippage, swapInData, swapOutData, userAddress, max]);

  useEffect(() => {
    if (skip) return;

    const fetchRoute = async () => {
      if (!swapInData.underlyingAsset || !swapOutData.underlyingAsset) return;

      setLoading(true);

      try {
        const route = await exactInTx();

        setError('');
        setSwapCallData(route.swapCallData);
        setAugustus(route.augustus);
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
  }, [exactInTx, error, skip, swapInData.underlyingAsset, swapOutData.underlyingAsset]);

  return {
    outputAmount,
    outputAmountUSD,
    inputAmount,
    inputAmountUSD,
    swapCallData,
    augustus,
    loading,
    error,
  };
};
