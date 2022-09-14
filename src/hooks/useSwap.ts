import {
  constructPartialSDK,
  constructFetchFetcher,
  constructGetRate,
  constructBuildTx,
  TransactionParams,
} from '@paraswap/sdk';
import { OptimalRate, SwapSide, ContractMethod } from 'paraswap-core';
import { useCallback, useEffect, useState } from 'react';
import { ComputedReserveData } from './app-data-provider/useAppDataProvider';
import { ChainId } from '@aave/contract-helpers';
import { BigNumberZeroDecimal, normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { RateOptions } from '@paraswap/sdk/dist/rates';

export type SwapVariant = 'exactIn' | 'exactOut';

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
  variant: SwapVariant;
  userAddress: string;
  chainId: ChainId;
  skip?: boolean;
  maxSlippage: number;
};

const MESSAGE_MAP = {
  ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT:
    'Price impact too high. Please try a different amount or asset pair.',
  // not sure why this error-code is not upper-cased
  'No routes found with enough liquidity': 'No routes found with enough liquidity.',
};

export const useCollateralRepaySwap = ({
  swapIn,
  swapOut,
  variant,
  userAddress,
  max,
  chainId,
  skip,
  maxSlippage,
}: UseSwapProps) => {
  const paraSwap = getParaswap(chainId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [swapCallData, setSwapCallData] = useState<string>('');
  const [augustus, setAugustus] = useState<string>('');
  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [outputAmountUSD, setOutputAmountUSD] = useState<string>('');
  const [inputAmountUSD, setInputAmountUSD] = useState<string>('');

  const fetchSellRoute = useCallback(async () => {
    // The 'Sell' route will take the input token and amount, and try to swap for the specified
    // output token minus the maximum slippage. This should be used when the user is trying
    // repay with collateral and the collateral amount is less than the debt amount.
    if (!swapIn.amount || swapIn.amount === '0') {
      setSwapCallData('');
      setAugustus('');
      setInputAmount('0');
      setOutputAmount('0');
      setInputAmountUSD('0');
      setOutputAmountUSD('0');
      return;
    }

    const _amount = valueToBigNumber(swapIn.amount);
    const amount = normalizeBN(_amount, swapIn.decimals * -1);

    try {
      const options: RateOptions = {
        partner: 'aave',
      };

      const route = await paraSwap.getRate({
        amount: amount.toFixed(0),
        srcToken: swapIn.underlyingAsset,
        srcDecimals: swapIn.decimals,
        destToken: swapOut.underlyingAsset,
        destDecimals: swapOut.decimals,
        userAddress,
        side: SwapSide.SELL,
        options,
      });

      setError('');

      const { swapCallData, augustus, destAmountWithSlippage } = await getSwapCallData({
        srcToken: swapIn.underlyingAsset,
        srcDecimals: swapIn.decimals,
        destToken: swapOut.underlyingAsset,
        destDecimals: swapOut.decimals,
        user: userAddress,
        route: route as OptimalRate,
        chainId: chainId,
        maxSlippage,
      });
      setSwapCallData(swapCallData);
      setAugustus(augustus);
      setInputAmount(swapIn.amount);
      setOutputAmount(normalize(destAmountWithSlippage, swapOut.decimals));
      setInputAmountUSD(route.srcUSD);
      setOutputAmountUSD(route.destUSD);
    } catch (e) {
      console.log(e);
      console.log(e.message);
      const message = (MESSAGE_MAP as { [key: string]: string })[e.message];
      setError(message || 'There was an issue fetching data from Paraswap');
    }
  }, [
    chainId,
    maxSlippage,
    paraSwap,
    swapIn.amount,
    swapIn.decimals,
    swapIn.underlyingAsset,
    swapOut.decimals,
    swapOut.underlyingAsset,
    userAddress,
  ]);

  const fetchBuyRoute = useCallback(async () => {
    // The 'Buy' route will try to swap the input token and apply positive slippage to the amount
    // in order to get the exact output amount. This should be used when the user is trying to
    // repay with collateral and the collateral amount is greater than the debt amount.
    if (!swapOut.amount || swapOut.amount === '0') {
      setSwapCallData('');
      setAugustus('');
      setInputAmount('0');
      setOutputAmount('0');
      setInputAmountUSD('0');
      setOutputAmountUSD('0');
      return;
    }

    let _amount = valueToBigNumber(swapOut.amount);
    if (max) {
      // variableBorrowAPY in most cases should be higher than stableRate so while this is slightly inaccurate it should be enough
      _amount = _amount.plus(_amount.multipliedBy(swapIn.variableBorrowAPY).dividedBy(360 * 24));
    }
    const amount = normalizeBN(_amount, swapOut.decimals * -1);

    try {
      const options: RateOptions = {
        partner: 'aave',
      };

      if (max) {
        options.excludeContractMethods = [ContractMethod.simpleBuy];
      }

      console.log('amount', amount.toFixed(0));
      const route = await paraSwap.getRate({
        amount: amount.toFixed(0),
        srcToken: swapIn.underlyingAsset,
        srcDecimals: swapIn.decimals,
        destToken: swapOut.underlyingAsset,
        destDecimals: swapOut.decimals,
        userAddress,
        side: SwapSide.BUY,
        options,
      });

      setError('');

      const { swapCallData, augustus, srcAmountWithSlippage } = await getRepayCallData({
        srcToken: swapIn.underlyingAsset,
        srcDecimals: swapIn.decimals,
        destToken: swapOut.underlyingAsset,
        destDecimals: swapOut.decimals,
        user: userAddress,
        route: route as OptimalRate,
        chainId: chainId,
        maxSlippage,
      });

      setSwapCallData(swapCallData);
      setAugustus(augustus);
      setInputAmount(normalize(srcAmountWithSlippage, swapIn.decimals));
      setOutputAmount(normalize(route.destAmount, swapOut.decimals));
      setInputAmountUSD(route.srcUSD);
      setOutputAmountUSD(route.destUSD);
      console.log(normalize(srcAmountWithSlippage, swapIn.decimals));
    } catch (e) {
      console.log(e);
      console.log(e.message);
      const message = (MESSAGE_MAP as { [key: string]: string })[e.message];
      setError(message || 'There was an issue fetching data from Paraswap');
    }
  }, [
    chainId,
    max,
    maxSlippage,
    paraSwap,
    swapIn.decimals,
    swapIn.underlyingAsset,
    swapIn.variableBorrowAPY,
    swapOut.amount,
    swapOut.decimals,
    swapOut.underlyingAsset,
    userAddress,
  ]);

  useEffect(() => {
    if (skip) return;

    const fetchRoute = async () => {
      if (!swapIn.underlyingAsset || !swapOut.underlyingAsset) return;

      setLoading(true);
      if (variant === 'exactIn') {
        await fetchSellRoute();
      } else {
        await fetchBuyRoute();
      }
      setLoading(false);
    };

    const interval = setInterval(
      () => {
        fetchRoute();
      },
      error ? 3000 : 15000
    );

    fetchRoute();

    return () => clearInterval(interval);
  }, [
    error,
    fetchBuyRoute,
    fetchSellRoute,
    skip,
    swapIn.underlyingAsset,
    swapOut.underlyingAsset,
    variant,
  ]);

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

export const useSwap = ({
  swapIn,
  swapOut,
  variant,
  userAddress: userId,
  max,
  chainId,
  skip,
}: UseSwapProps) => {
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
  maxSlippage: number;
};

type GetSwapAndRepayCallDataProps = {
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
  maxSlippage,
}: GetSwapCallDataProps) => {
  const paraSwap = getParaswap(chainId);
  const destAmountWithSlippage = new BigNumberZeroDecimal(route.destAmount)
    .multipliedBy(100 - maxSlippage)
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
      destAmountWithSlippage,
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
