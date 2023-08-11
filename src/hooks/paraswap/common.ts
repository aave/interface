import { ChainId, valueToWei } from '@aave/contract-helpers';
import { BigNumberZeroDecimal, normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import {
  constructBuildTx,
  constructFetchFetcher,
  constructGetRate,
  constructPartialSDK,
  ContractMethod,
  OptimalRate,
  SwapSide,
  TransactionParams,
} from '@paraswap/sdk';
import { RateOptions } from '@paraswap/sdk/dist/methods/swap/rates';

import { ComputedReserveData } from '../app-data-provider/useAppDataProvider';

const FEE_CLAIMER_ADDRESS = '0x9abf798f5314BFd793A9E57A654BEd35af4A1D60';

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

const MESSAGE_MAP: { [key: string]: string } = {
  ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT:
    'Price impact too high. Please try a different amount or asset pair.',
  // not sure why this error-code is not upper-cased
  'No routes found with enough liquidity': 'No routes found with enough liquidity.',
};

const MESSAGE_REGEX_MAP: Array<{ regex: RegExp; message: string }> = [
  {
    regex: /^Amount \d+ is too small to proceed$/,
    message: 'Amount is too small. Please try larger amount.',
  },
];

/**
 * Converts Paraswap error message to message for displaying in interface
 * @param message Paraswap error message
 * @returns Message for displaying in interface
 */
export function convertParaswapErrorMessage(message: string): string {
  if (message in MESSAGE_MAP) {
    return MESSAGE_MAP[message];
  }

  const newMessage = MESSAGE_REGEX_MAP.find((mapping) => mapping.regex.test(message))?.message;
  return newMessage || 'There was an issue fetching data from Paraswap';
}

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
    options.excludeContractMethods = [
      ContractMethod.simpleSwap,
      ContractMethod.directUniV3Swap,
      ContractMethod.directBalancerV2GivenInSwap,
      ContractMethod.directBalancerV2GivenOutSwap,
      ContractMethod.directCurveV1Swap,
      ContractMethod.directCurveV2Swap,
    ];
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
    options.excludeContractMethods = [
      ContractMethod.simpleBuy,
      ContractMethod.directUniV3Buy,
      ContractMethod.directBalancerV2GivenOutSwap,
    ];
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
          // partnerAddress: FEE_CLAIMER_ADDRESS,
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
          destToken,
          srcAmount: srcAmountWithSlippage,
          destAmount: route.destAmount,
          priceRoute: route,
          userAddress: user,
          partner: 'aave',
          // partnerAddress: FEE_CLAIMER_ADDRESS,
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
      throw new Error('Error building transaction parameters');
    }
  };

  return {
    getRate,
    getTransactionParams,
  };
};

// generate signature approval a certain threshold above the current balance to account for accrued interest
export const SIGNATURE_AMOUNT_MARGIN = 0.1;

// Calculate aToken amount to request for signature, adding small margin to account for accruing interest
export const calculateSignedAmount = (amount: string, decimals: number, margin?: number) => {
  const amountWithMargin = Number(amount) + Number(amount) * (margin ?? SIGNATURE_AMOUNT_MARGIN); // 10% margin for aToken interest accrual, custom amount for actions where output amount is variable
  const formattedAmountWithMargin = valueToWei(amountWithMargin.toString(), decimals);
  return formattedAmountWithMargin;
};
