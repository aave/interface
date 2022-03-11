import { ParaSwap, APIError, Transaction } from 'paraswap';
import { ContractMethod, SwapSide } from 'paraswap/build/constants';
import { OptimalRate } from 'paraswap-core';
import { useCallback, useEffect, useState } from 'react';
import { ComputedReserveData } from './app-data-provider/useAppDataProvider';
import { ChainId } from '@aave/contract-helpers';
import { BigNumberZeroDecimal, normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';

const mainnetParaswap = new ParaSwap(ChainId.mainnet);
const polygonParaswap = new ParaSwap(ChainId.polygon);
const avalancheParaswap = new ParaSwap(ChainId.avalanche);

const getParaswap = (chainId: ChainId) => {
  if (ChainId.mainnet === chainId) return mainnetParaswap;
  if (ChainId.polygon === chainId) return polygonParaswap;
  if (ChainId.avalanche === chainId) return avalancheParaswap;
  throw new Error('chain not supported');
};

type UseSwapProps = {
  max?: boolean;
  swapIn: ComputedReserveData & { amount: string };
  swapOut: ComputedReserveData & { amount: string };
  variant: 'exactIn' | 'exactOut';
  userId?: string;
  chainId: ChainId;
};

const MESSAGE_MAP = {
  ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT: 'Price impact to high',
};

// TODO: resolve error codes to human understandable error messages https://github.com/paraswap/paraswap-sdk/issues/22
export const useSwap = ({ swapIn, swapOut, variant, userId, max, chainId }: UseSwapProps) => {
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
    if (max && swapIn.supplyAPY !== '0') {
      _amount = _amount.plus(_amount.multipliedBy(swapIn.supplyAPY).dividedBy(360 * 24));
    }
    const amount = normalizeBN(
      _amount,
      (variant === 'exactIn' ? swapIn.decimals : swapOut.decimals) * -1
    );
    try {
      const response = await paraSwap.getRate(
        swapIn.underlyingAsset,
        swapOut.underlyingAsset,
        amount.toFixed(0),
        userId,
        variant === 'exactIn' ? SwapSide.SELL : SwapSide.BUY,
        {
          partner: 'aave',
          ...(max
            ? {
                excludeDEXS: 'Balancer',
                excludeContractMethods: [ContractMethod.simpleSwap],
              }
            : {}),
        },
        swapIn.decimals,
        swapOut.decimals
      );
      if ((response as APIError).message) throw new Error((response as APIError).message);
      setError('');
      setPriceRoute(response as OptimalRate);
    } catch (e) {
      console.log(e);
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
    setPriceRoute(null);
    const timeout = setTimeout(fetchRoute, 400);
    return () => clearTimeout(timeout);
  }, [fetchRoute]);

  // updates the route based on on interval
  useEffect(() => {
    const interval = setInterval(fetchRoute, error ? 3000 : 15000);
    return () => clearInterval(interval);
  }, [fetchRoute, error]);

  if (priceRoute) {
    return {
      // full object needed for building the tx
      priceRoute: priceRoute,
      outputAmount: normalize(priceRoute.destAmount ?? '0', swapOut.decimals),
      outputAmountUSD: priceRoute.destUSD ?? '0',
      inputAmount: normalize(priceRoute.srcAmount ?? '0', swapIn.decimals),
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
  const params = await paraSwap.buildTx(
    srcToken,
    destToken,
    route.srcAmount,
    destAmountWithSlippage,
    route,
    user,
    'aave',
    undefined,
    undefined,
    undefined,
    { ignoreChecks: true },
    srcDecimals,
    destDecimals
  );
  if ((params as APIError).message) throw new Error('Error getting txParams');
  return { swapCallData: (params as Transaction).data, augustus: (params as Transaction).to };
};
