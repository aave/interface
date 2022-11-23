import { ChainId, ERC20Service, EthereumTransactionTypeExtended } from '@aave/contract-helpers';
import { BigNumberZeroDecimal, normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import {
  constructBuildTx,
  constructFetchFetcher,
  constructGetRate,
  constructPartialSDK,
  TransactionParams,
} from '@paraswap/sdk';
import { RateOptions } from '@paraswap/sdk/dist/rates';
import { constants, ethers } from 'ethers';
import { ContractMethod, OptimalRate, SwapSide } from 'paraswap-core';

import { ComputedReserveData } from '../app-data-provider/useAppDataProvider';

export type UseSwapProps = {
  chainId: ChainId;
  max: boolean;
  maxSlippage: number;
  swapIn: SwapReserveData;
  swapOut: SwapReserveData;
  userAddress: string;
  skip?: boolean;
};

export type SwapReserveData = ComputedReserveData & { amount: string };

export type SwapData = Pick<
  SwapReserveData,
  'amount' | 'underlyingAsset' | 'decimals' | 'supplyAPY' | 'variableBorrowAPY'
>;

export type SwapVariant = 'exactIn' | 'exactOut';

type SwapRateParams = {
  inputAmount: string;
  outputAmount: string;
  inputAmountUSD: string;
  outputAmountUSD: string;
};

type SwapTransactionParams = SwapRateParams & {
  swapCallData: string;
  augustus: string;
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

export interface ParaSwapParams {
  swapInData: SwapData;
  swapOutData: SwapData;
  userAddress: string;
  chainId: ChainId;
  maxSlippage: number;
  max: boolean;
  swapVariant: SwapVariant;
}

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

export const getParaswap = (chainId: ChainId) => {
  if (ChainId.mainnet === chainId) return mainnetParaswap;
  if (ChainId.polygon === chainId) return polygonParaswap;
  if (ChainId.avalanche === chainId) return avalancheParaswap;
  if (ChainId.fantom === chainId) return fantomParaswap;
  if (ChainId.arbitrum_one === chainId) return arbitrumParaswap;
  if (ChainId.optimism === chainId) return optimismParaswap;
  throw new Error('chain not supported');
};

export const MESSAGE_MAP: { [key: string]: string } = {
  ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT:
    'Price impact too high. Please try a different amount or asset pair.',
  // not sure why this error-code is not upper-cased
  'No routes found with enough liquidity': 'No routes found with enough liquidity.',
};

/**
 * Uses the Paraswap SDK to fetch the transaction parameters for a 'Sell', or 'Exact In' swap.
 * This means that swap in amount is fixed, and the slippage will be applied to the amount received.
 * There are two steps in fetching the transaction parameters. First an optimal route is determined
 * using the Paraswap SDK. Then the transaction parameters are fetched using the optimal route.
 * @param {SwapData} swapIn
 * @param {SwapData} swapOut
 * @param {ChainId} chainId
 * @param {string} userAddress
 * @param {number} maxSlippage
 * @param {boolean} [max]
 * @returns {Promise<SwapTransactionParams>}
 */
export async function fetchExactInTxParams(
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  maxSlippage: number,
  max?: boolean
): Promise<SwapTransactionParams> {
  if (!swapIn.amount || swapIn.amount === '0' || isNaN(+swapIn.amount)) {
    return {
      swapCallData: '',
      augustus: '',
      inputAmount: '0',
      outputAmount: '0',
      inputAmountUSD: '0',
      outputAmountUSD: '0',
    };
  }

  let swapInAmount = valueToBigNumber(swapIn.amount);
  if (max && swapIn.supplyAPY !== '0') {
    swapInAmount = swapInAmount.plus(
      swapInAmount.multipliedBy(swapIn.supplyAPY).dividedBy(360 * 24)
    );
  }

  const amount = normalizeBN(swapInAmount, swapIn.decimals * -1);

  const options: RateOptions = {
    partner: 'aave',
  };

  if (max) {
    options.excludeContractMethods = [ContractMethod.simpleSwap];
  }

  const swapper = ExactInSwapper(chainId);
  const route = await swapper.getRate(
    amount.toFixed(0),
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userAddress,
    options
  );

  const { swapCallData, augustus, destAmountWithSlippage } = await swapper.getTransactionParams(
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userAddress,
    route,
    maxSlippage
  );

  return {
    swapCallData,
    augustus,
    inputAmount: normalize(route.srcAmount, swapIn.decimals),
    outputAmount: normalize(destAmountWithSlippage, swapOut.decimals),
    inputAmountUSD: route.srcUSD,
    outputAmountUSD: route.destUSD,
  };
}

/**
 * Uses the Paraswap SDK to fetch the swap rate for a 'Sell', or 'Exact In' swap.
 * This means that swap in amount is fixed, and the slippage will be applied to the amount received.
 * @param {SwapData} swapIn
 * @param {SwapData} swapOut
 * @param {ChainId} chainId
 * @param {string} userAddress
 * @param {number} maxSlippage
 * @param {boolean} [max]
 * @returns {Promise<SwapRateParams>}
 */
export async function fetchExactInRate(
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  maxSlippage: number,
  max?: boolean
): Promise<SwapRateParams> {
  if (!swapIn.amount || swapIn.amount === '0' || isNaN(+swapIn.amount)) {
    return {
      inputAmount: '0',
      outputAmount: '0',
      inputAmountUSD: '0',
      outputAmountUSD: '0',
    };
  }

  let swapInAmount = valueToBigNumber(swapIn.amount);
  if (max && swapIn.supplyAPY !== '0') {
    swapInAmount = swapInAmount.plus(
      swapInAmount.multipliedBy(swapIn.supplyAPY).dividedBy(360 * 24)
    );
  }

  const amount = normalizeBN(swapInAmount, swapIn.decimals * -1);

  const options: RateOptions = {
    partner: 'aave',
  };

  if (max) {
    options.excludeContractMethods = [ContractMethod.simpleSwap];
  }

  const swapper = ExactInSwapper(chainId);
  const route = await swapper.getRate(
    amount.toFixed(0),
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userAddress,
    options
  );

  let destAmount = Number(route.destAmount) / 10 ** swapOut.decimals;
  destAmount = destAmount - destAmount * (Number(maxSlippage) / 100);

  return {
    inputAmount: normalize(route.srcAmount, swapIn.decimals),
    outputAmount: destAmount.toString(),
    inputAmountUSD: route.srcUSD,
    outputAmountUSD: route.destUSD,
  };
}

/**
 * Uses the Paraswap SDK to fetch the transaction parameters for a 'Buy', or 'Exact Out' swap.
 * This means that amount received is fixed, and positive slippage will be applied to the input amount.
 * There are two steps in fetching the transaction parameters. First an optimal route is determined
 * using the Paraswap SDK. Then the transaction parameters are fetched using the optimal route.
 * @param {SwapData} swapIn
 * @param {SwapData} swapOut
 * @param {ChainId} chainId
 * @param {string} userAddress
 * @param {number} maxSlippage
 * @param {boolean} max
 * @returns {Promise<SwapTransactionParams>}
 */
export async function fetchExactOutTxParams(
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  maxSlippage: number,
  max?: boolean
): Promise<SwapTransactionParams> {
  if (!swapOut.amount || swapOut.amount === '0' || isNaN(+swapOut.amount)) {
    return {
      swapCallData: '',
      augustus: '',
      inputAmount: '0',
      outputAmount: '0',
      inputAmountUSD: '0',
      outputAmountUSD: '0',
    };
  }

  let swapOutAmount = valueToBigNumber(swapOut.amount);
  if (max) {
    // variableBorrowAPY in most cases should be higher than stableRate so while this is slightly inaccurate it should be enough
    swapOutAmount = swapOutAmount.plus(
      swapOutAmount.multipliedBy(swapIn.variableBorrowAPY).dividedBy(360 * 24)
    );
  }
  const amount = normalizeBN(swapOutAmount, swapOut.decimals * -1);

  const options: RateOptions = {
    partner: 'aave',
  };

  if (max) {
    options.excludeContractMethods = [ContractMethod.simpleBuy];
  }

  const swapper = ExactOutSwapper(chainId);

  const route = await swapper.getRate(
    amount.toFixed(0),
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userAddress,
    options
  );

  const { swapCallData, augustus, srcAmountWithSlippage } = await swapper.getTransactionParams(
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userAddress,
    route,
    maxSlippage
  );

  return {
    swapCallData,
    augustus,
    inputAmount: normalize(srcAmountWithSlippage, swapIn.decimals),
    outputAmount: normalize(route.destAmount, swapOut.decimals),
    inputAmountUSD: route.srcUSD,
    outputAmountUSD: route.destUSD,
  };
}

/**
 * Uses the Paraswap SDK to fetch the swap rate for a 'Buy', or 'Exact Out' swap.
 * This means that amount received is fixed, and positive slippage will be applied to the input amount.
 * @param {SwapData} swapIn
 * @param {SwapData} swapOut
 * @param {ChainId} chainId
 * @param {string} userAddress
 * @param {number} maxSlippage
 * @param {boolean} max
 * @returns {Promise<SwapRateParams>}
 */
export async function fetchExactOutRate(
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  maxSlippage: number,
  max: boolean
): Promise<SwapRateParams> {
  if (!swapOut.amount || swapOut.amount === '0' || isNaN(+swapOut.amount)) {
    return {
      inputAmount: '0',
      outputAmount: '0',
      inputAmountUSD: '0',
      outputAmountUSD: '0',
    };
  }

  let swapOutAmount = valueToBigNumber(swapOut.amount);
  if (max) {
    // variableBorrowAPY in most cases should be higher than stableRate so while this is slightly inaccurate it should be enough
    swapOutAmount = swapOutAmount.plus(
      swapOutAmount.multipliedBy(swapIn.variableBorrowAPY).dividedBy(360 * 24)
    );
  }
  const amount = normalizeBN(swapOutAmount, swapOut.decimals * -1);

  const options: RateOptions = {
    partner: 'aave',
  };

  if (max) {
    options.excludeContractMethods = [ContractMethod.simpleBuy];
  }

  const swapper = ExactOutSwapper(chainId);

  const route = await swapper.getRate(
    amount.toFixed(0),
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userAddress,
    options
  );

  let srcAmount = Number(route.srcAmount) / 10 ** swapOut.decimals;
  srcAmount = srcAmount + srcAmount * (Number(maxSlippage) / 100);

  return {
    inputAmount: srcAmount.toString(),
    outputAmount: normalize(route.destAmount, swapOut.decimals),
    inputAmountUSD: route.srcUSD,
    outputAmountUSD: route.destUSD,
  };
}

const ExactInSwapper = (chainId: ChainId) => {
  const paraSwap = getParaswap(chainId);

  const getRate = async (
    amount: string,
    srcToken: string,
    srcDecimals: number,
    destToken: string,
    destDecimals: number,
    userAddress: string,
    options: RateOptions
  ) => {
    const priceRoute = await paraSwap.getRate({
      amount,
      srcToken,
      srcDecimals,
      destToken,
      destDecimals,
      userAddress,
      side: SwapSide.SELL,
      options,
    });

    return priceRoute;
  };

  const getTransactionParams = async (
    srcToken: string,
    srcDecimals: number,
    destToken: string,
    destDecimals: number,
    user: string,
    route: OptimalRate,
    maxSlippage: number
  ) => {
    const { swapCallData, augustus, destAmountWithSlippage } = await getSwapCallData({
      srcToken,
      srcDecimals,
      destToken,
      destDecimals,
      user,
      route,
      chainId: chainId,
      maxSlippage,
    });

    return {
      swapCallData,
      augustus,
      destAmountWithSlippage,
    };
  };

  return {
    getRate,
    getTransactionParams,
  };
};

const ExactOutSwapper = (chainId: ChainId) => {
  const paraSwap = getParaswap(chainId);

  const getRate = async (
    amount: string,
    srcToken: string,
    srcDecimals: number,
    destToken: string,
    destDecimals: number,
    userAddress: string,
    options: RateOptions
  ) => {
    const priceRoute = await paraSwap.getRate({
      amount,
      srcToken,
      srcDecimals,
      destToken,
      destDecimals,
      userAddress,
      side: SwapSide.BUY,
      options,
    });

    return priceRoute;
  };

  const getTransactionParams = async (
    srcToken: string,
    srcDecimals: number,
    destToken: string,
    destDecimals: number,
    user: string,
    route: OptimalRate,
    maxSlippage: number
  ) => {
    const { swapCallData, augustus, srcAmountWithSlippage } = await getRepayCallData({
      srcToken,
      srcDecimals,
      destToken,
      destDecimals,
      user,
      route,
      chainId,
      maxSlippage,
    });

    return {
      swapCallData,
      augustus,
      srcAmountWithSlippage,
    };
  };

  return {
    getRate,
    getTransactionParams,
  };
};

const getSwapCallData = async ({
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

const getRepayCallData = async ({
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

export const fetchTxParams = async (
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  maxSlippage: number,
  swapVariant: SwapVariant,
  max?: boolean
): Promise<SwapTransactionParams> => {
  if (swapVariant === 'exactIn') {
    return await fetchExactInTxParams(swapIn, swapOut, chainId, userAddress, maxSlippage, max);
  } else {
    return await fetchExactOutTxParams(swapIn, swapOut, chainId, userAddress, maxSlippage, max);
  }
};
