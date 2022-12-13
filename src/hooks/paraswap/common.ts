import { ChainId } from '@aave/contract-helpers';
import { BigNumberZeroDecimal, normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import {
  constructBuildTx,
  constructFetchFetcher,
  constructGetRate,
  constructPartialSDK,
  TransactionParams,
} from '@paraswap/sdk';
import { RateOptions } from '@paraswap/sdk/dist/methods/swap/rates';
import { ContractMethod, OptimalRate, SwapSide } from 'paraswap-core';

import { ComputedReserveData } from '../app-data-provider/useAppDataProvider';

export type UseSwapProps = {
  chainId: ChainId;
  max: boolean;
  maxSlippage: number;
  swapIn: SwapReserveData;
  swapOut: SwapReserveData;
  userAddress: string;
  skip: boolean;
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

export type SwapTransactionParams = SwapRateParams & {
  swapCallData: string;
  augustus: string;
};

const ParaSwap = (chainId: number) => {
  const fetcher = constructFetchFetcher(fetch); // alternatively constructFetchFetcher
  return constructPartialSDK(
    {
      chainId,
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
 * Uses the Paraswap SDK to build the transaction parameters for a 'Sell', or 'Exact In' swap.
 * @param {OptimalRate} route
 * @param {SwapData} swapIn
 * @param {SwapData} swapOut
 * @param {ChainId} chainId
 * @param {string} userAddress
 * @param {number} maxSlippage
 * @param {boolean} [max]
 * @returns {Promise<SwapTransactionParams>}
 */
export async function fetchExactInTxParams(
  route: OptimalRate,
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  maxSlippage: number
): Promise<SwapTransactionParams> {
  const swapper = ExactInSwapper(chainId);
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
 * Uses the Paraswap SDK to fetch the route for a 'Sell', or 'Exact In' swap.
 * The swap in amount is fixed, and the slippage will be applied to the amount received.
 * @param {SwapData} swapIn
 * @param {SwapData} swapOut
 * @param {ChainId} chainId
 * @param {string} userAddress
 * @param {number} maxSlippage
 * @param {boolean} [max]
 * @returns {Promise<OptimalRate>}
 */
export async function fetchExactInRate(
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  max?: boolean
): Promise<OptimalRate> {
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
  return await swapper.getRate(
    amount.toFixed(0),
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userAddress,
    options
  );
}

/**
 * Uses the Paraswap SDK to build the transaction parameters for a 'Buy', or 'Exact Out' swap.
 * @param {OptimalRate} route
 * @param {SwapData} swapIn
 * @param {SwapData} swapOut
 * @param {ChainId} chainId
 * @param {string} userAddress
 * @param {number} maxSlippage
 * @returns {Promise<SwapTransactionParams>}
 */
export async function fetchExactOutTxParams(
  route: OptimalRate,
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  maxSlippage: number
): Promise<SwapTransactionParams> {
  const swapper = ExactOutSwapper(chainId);
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
 * @returns {Promise<OptimalRate>}
 */
export async function fetchExactOutRate(
  swapIn: SwapData,
  swapOut: SwapData,
  chainId: ChainId,
  userAddress: string,
  max: boolean
): Promise<OptimalRate> {
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

  return await swapper.getRate(
    amount.toFixed(0),
    swapIn.underlyingAsset,
    swapIn.decimals,
    swapOut.underlyingAsset,
    swapOut.decimals,
    userAddress,
    options
  );
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
    const destAmountWithSlippage = new BigNumberZeroDecimal(route.destAmount)
      .multipliedBy(100 - maxSlippage)
      .dividedBy(100)
      .toFixed(0);

    try {
      const params = await paraSwap.buildTx(
        {
          srcToken,
          srcDecimals,
          srcAmount: route.srcAmount,
          destToken,
          destDecimals,
          destAmount: destAmountWithSlippage,
          priceRoute: route,
          userAddress: user,
          partner: 'aave',
          partnerAddress: '0x9abf798f5314BFd793A9E57A654BEd35af4A1D60',
        },
        { ignoreChecks: true }
      );

      return {
        swapCallData: (params as TransactionParams).data,
        augustus: (params as TransactionParams).to,
        destAmountWithSlippage,
      };
    } catch (e) {
      console.error(e);
      throw new Error('Error building transaction parameters');
    }
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
    const srcAmountWithSlippage = new BigNumberZeroDecimal(route.srcAmount)
      .multipliedBy(100 + maxSlippage)
      .dividedBy(100)
      .toFixed(0);

    try {
      const params = await paraSwap.buildTx(
        {
          srcToken,
          srcDecimals,
          srcAmount: srcAmountWithSlippage,
          destToken,
          destDecimals,
          destAmount: route.destAmount,
          priceRoute: route,
          userAddress: user,
          partner: 'aave',
          partnerAddress: '0x9abf798f5314BFd793A9E57A654BEd35af4A1D60',
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
      throw new Error('Error building transaction parameters');
    }
  };

  return {
    getRate,
    getTransactionParams,
  };
};
