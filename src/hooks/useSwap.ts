import { ChainId } from '@aave/contract-helpers';
import { BigNumberZeroDecimal, normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import {
  constructBuildTx,
  constructFetchFetcher,
  constructGetRate,
  constructPartialSDK,
  TransactionParams,
} from '@paraswap/sdk';
import { ContractMethod, OptimalRate, SwapSide } from 'paraswap-core';
import { useCallback, useEffect, useState } from 'react';

import { ComputedReserveData } from './app-data-provider/useAppDataProvider';

const ParaSwap = (chainId: number) => {
  const fetcher = constructFetchFetcher(fetch); // alternatively constructFetchFetcher
  return constructPartialSDK(
    {
      network: chainId,
      fetcher,
    },
    constructBuildTx,
    constructGetRate
  );
};

const mainnetParaswap = ParaSwap(ChainId.mainnet);
const polygonParaswap = ParaSwap(ChainId.polygon);
const avalancheParaswap = ParaSwap(ChainId.avalanche);
const fantomParaswap = ParaSwap(ChainId.fantom);
const arbitrumParaswap = ParaSwap(ChainId.arbitrum_one);
const optimismParaswap = ParaSwap(ChainId.optimism);

const getParaswap = (chainId: ChainId) => {
  if (ChainId.mainnet === chainId) return mainnetParaswap;
  if (ChainId.polygon === chainId) return polygonParaswap;
  if (ChainId.avalanche === chainId) return avalancheParaswap;
  if (ChainId.fantom === chainId) return fantomParaswap;
  if (ChainId.arbitrum_one === chainId) return arbitrumParaswap;
  if (ChainId.optimism === chainId) return optimismParaswap;
  throw new Error('chain not supported');
};

type UseSwapProps = {
  max?: boolean;
  swapIn: ComputedReserveData & { amount: string };
  swapOut: ComputedReserveData & { amount: string };
  variant: 'exactIn' | 'exactOut';
  userId?: string;
  chainId: ChainId;
  skip?: boolean;
};

const MESSAGE_MAP = {
  ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT: 'Price impact to high',
  // not sure why this error-code is not upper-cased
  'No routes found with enough liquidity': 'No routes found with enough liquidity',
};

export const useSwap = ({ swapIn, swapOut, variant, userId, max, chainId, skip }: UseSwapProps) => {
  const paraSwap = getParaswap(chainId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceRoute, setPriceRoute] = useState<OptimalRate | null>(null);

  const fetchRoute = useCallback(async () => {
    if (!swapIn.underlyingAsset || !swapOut.underlyingAsset || !userId) return;
    if (variant === 'exactIn' && (!swapIn.amount || swapIn.amount === '0')) return;
    if (variant === 'exactOut' && (!swapOut.amount || swapOut.amount === '0')) return;
    setLoading(true);
    let _amount = valueToBigNumber(variant === 'exactIn' ? swapIn.amount : swapOut.amount);
    if (variant === 'exactIn' && max && swapIn.supplyAPY !== '0') {
      _amount = _amount.plus(_amount.multipliedBy(swapIn.supplyAPY).dividedBy(360 * 24));
    }
    if (variant === 'exactOut' && max) {
      // variableBorrowAPY in most cases should be higher than stableRate so while this is slightly inaccurate it should be enough
      _amount = _amount.plus(_amount.multipliedBy(swapIn.variableBorrowAPY).dividedBy(360 * 24));
    }
    const amount = normalizeBN(
      _amount,
      (variant === 'exactIn' ? swapIn.decimals : swapOut.decimals) * -1
    );

    try {
      const excludedMethod =
        variant === 'exactIn' ? ContractMethod.simpleSwap : ContractMethod.simpleBuy;
      const response = await paraSwap.getRate({
        amount: amount.toFixed(0),
        srcToken: swapIn.underlyingAsset,
        srcDecimals: swapIn.decimals,
        destToken: swapOut.underlyingAsset,
        destDecimals: swapOut.decimals,
        userAddress: userId,
        side: variant === 'exactIn' ? SwapSide.SELL : SwapSide.BUY,
        options: {
          partner: 'aave',
          excludeDEXS:
            'ParaSwapPool,ParaSwapPool2,ParaSwapPool3,ParaSwapPool4,ParaSwapPool5,ParaSwapPool6,ParaSwapPool7,ParaSwapPool8,ParaSwapPool9,ParaSwapPool10',
          ...(max
            ? {
                excludeDEXS:
                  'Balancer,ParaSwapPool,ParaSwapPool2,ParaSwapPool3,ParaSwapPool4,ParaSwapPool5,ParaSwapPool6,ParaSwapPool7,ParaSwapPool8,ParaSwapPool9,ParaSwapPool10',
                excludeContractMethods: [excludedMethod],
              }
            : {}),
        },
      });

      setError('');
      setPriceRoute(response as OptimalRate);
    } catch (e) {
      console.log(e);
      console.log(e.message);
      const message = (MESSAGE_MAP as { [key: string]: string })[e.message];
      setError(message || 'There was an issue fetching data from Paraswap');
    }
    setLoading(false);
  }, [
    swapIn.amount,
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.amount,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userId,
    variant,
    max,
    chainId,
  ]);

  // updates the route on input change
  useEffect(() => {
    if (skip) return;
    setPriceRoute(null);
    const timeout = setTimeout(fetchRoute, 400);
    return () => clearTimeout(timeout);
  }, [fetchRoute, skip]);

  // updates the route based on on interval
  useEffect(() => {
    if (skip) return;
    const interval = setInterval(fetchRoute, error ? 3000 : 15000);
    return () => clearInterval(interval);
  }, [fetchRoute, error, skip]);

  if (priceRoute) {
    return {
      // full object needed for building the tx
      priceRoute: priceRoute,
      outputAmount: normalize(
        priceRoute.destAmount ?? '0',
        variant === 'exactIn' ? swapOut.decimals : swapOut.decimals
      ),
      outputAmountUSD: priceRoute.destUSD ?? '0',
      inputAmount: normalize(
        priceRoute.srcAmount ?? '0',
        variant === 'exactIn' ? swapIn.decimals : swapIn.decimals
      ),
      inputAmountUSD: priceRoute.srcUSD ?? '0',
      loading: loading,
      error: error,
    };
  }
  return {
    // full object needed for building the tx
    priceRoute: null,
    outputAmount: '0',
    outputAmountUSD: '0',
    inputAmount: '0',
    inputAmountUSD: '0',
    loading: loading,
    error: error,
  };
};

type GetSwapCallDataProps = {
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  destDecimals: number;
  user: string;
  route: OptimalRate;
  max?: boolean;
  chainId: ChainId;
};

export type GetSwapAndRepayCallDataProps = {
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  destDecimals: number;
  user: string;
  route: OptimalRate;
  max?: boolean;
  chainId: ChainId;
  maxSlippage: number;
};

export const getSwapCallData = async ({
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
  route,
  chainId,
}: GetSwapCallDataProps) => {
  const paraSwap = getParaswap(chainId);
  const destAmountWithSlippage = new BigNumberZeroDecimal(route.destAmount)
    .multipliedBy(99)
    .dividedBy(100)
    .toFixed(0);

  try {
    const params = await paraSwap.buildTx(
      {
        srcToken,
        destToken,
        srcAmount: route.srcAmount,
        destAmount: destAmountWithSlippage,
        priceRoute: route,
        userAddress: user,
        partner: 'aave',
        srcDecimals,
        destDecimals,
      },
      { ignoreChecks: true }
    );

    return {
      swapCallData: (params as TransactionParams).data,
      augustus: (params as TransactionParams).to,
    };
  } catch (e) {
    console.log(e);
    throw new Error('Error getting txParams');
  }
};

export const getRepayCallData = async ({
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
  route,
  chainId,
  maxSlippage,
}: GetSwapAndRepayCallDataProps) => {
  const paraSwap = getParaswap(chainId);
  const srcAmountWithSlippage = new BigNumberZeroDecimal(route.srcAmount)
    .multipliedBy(100 + maxSlippage)
    .dividedBy(100)
    .toFixed(0);

  try {
    const params = await paraSwap.buildTx(
      {
        srcToken,
        destToken,
        srcAmount: srcAmountWithSlippage,
        destAmount: route.destAmount,
        priceRoute: route,
        userAddress: user,
        partner: 'aave',
        srcDecimals,
        destDecimals,
      },
      { ignoreChecks: true }
    );

    return {
      swapCallData: (params as TransactionParams).data,
      augustus: (params as TransactionParams).to,
      srcAmountWithSlippage,
    };
  } catch (e) {
    console.log(e);
    throw new Error('Error getting txParams');
  }
};
