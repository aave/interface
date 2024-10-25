import { ChainId, valueToWei } from '@aave/contract-helpers';
import { normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import {
  AaveV3Arbitrum,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3BNB,
  AaveV3Ethereum,
  AaveV3Fantom,
  AaveV3Optimism,
  AaveV3Polygon,
} from '@bgd-labs/aave-address-book';
import {
  BuildTxFunctions,
  constructBuildTx,
  constructFetchFetcher,
  constructGetRate,
  constructPartialSDK,
  ContractMethod,
  OptimalRate,
  SwapSide,
  TransactionParams,
} from '@paraswap/sdk';
import { GetRateFunctions, RateOptions } from '@paraswap/sdk/dist/methods/swap/rates';

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
      version: '6.2',
    },
    constructBuildTx,
    constructGetRate
  );
};

type ParaswapChainMap = {
  [key in ChainId]?: { paraswap: BuildTxFunctions & GetRateFunctions; feeTarget: string };
};

const paraswapNetworks: ParaswapChainMap = {
  [ChainId.mainnet]: {
    paraswap: ParaSwap(ChainId.mainnet),
    feeTarget: AaveV3Ethereum.COLLECTOR,
  },
  [ChainId.polygon]: {
    paraswap: ParaSwap(ChainId.polygon),
    feeTarget: AaveV3Polygon.COLLECTOR,
  },
  [ChainId.avalanche]: {
    paraswap: ParaSwap(ChainId.avalanche),
    feeTarget: AaveV3Avalanche.COLLECTOR,
  },
  [ChainId.fantom]: {
    paraswap: ParaSwap(ChainId.fantom),
    feeTarget: AaveV3Fantom.COLLECTOR,
  },
  [ChainId.arbitrum_one]: {
    paraswap: ParaSwap(ChainId.arbitrum_one),
    feeTarget: AaveV3Arbitrum.COLLECTOR,
  },
  [ChainId.optimism]: {
    paraswap: ParaSwap(ChainId.optimism),
    feeTarget: AaveV3Optimism.COLLECTOR,
  },
  [ChainId.base]: { paraswap: ParaSwap(ChainId.base), feeTarget: AaveV3Base.COLLECTOR },
  [ChainId.bnb]: { paraswap: ParaSwap(ChainId.bnb), feeTarget: AaveV3BNB.COLLECTOR },
};

export const getParaswap = (chainId: ChainId) => {
  const paraswap = paraswapNetworks[chainId];
  if (paraswap) {
    return paraswap;
  }

  throw new Error('Chain not supported');
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
  const { swapCallData, augustus } = await swapper.getTransactionParams(
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
    outputAmount: normalize(route.destAmount, swapOut.decimals),
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
      swapInAmount.multipliedBy(swapIn.supplyAPY).dividedBy(360 * 24 * 2)
    );
  }

  const amount = normalizeBN(swapInAmount, swapIn.decimals * -1);

  const options: RateOptions = {
    partner: 'aave',
  };

  if (max) {
    options.includeContractMethods = [ContractMethod.swapExactAmountIn];
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
  const { swapCallData, augustus } = await swapper.getTransactionParams(
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
  const swapOutAmount = valueToBigNumber(swapOut.amount);

  const amount = normalizeBN(swapOutAmount, swapOut.decimals * -1);

  const options: RateOptions = {
    partner: 'aave',
  };

  if (max) {
    options.includeContractMethods = [ContractMethod.swapExactAmountOut];
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

export const ExactInSwapper = (chainId: ChainId) => {
  const { paraswap, feeTarget } = getParaswap(chainId);

  const getRate = async (
    amount: string,
    srcToken: string,
    srcDecimals: number,
    destToken: string,
    destDecimals: number,
    userAddress: string,
    options: RateOptions
  ) => {
    const priceRoute = await paraswap.getRate({
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
    try {
      const params = await paraswap.buildTx(
        {
          srcToken,
          srcDecimals,
          srcAmount: route.srcAmount,
          destToken,
          destDecimals,
          slippage: maxSlippage * 100,
          priceRoute: route,
          userAddress: user,
          partnerAddress: feeTarget,
          takeSurplus: true,
          isDirectFeeTransfer: true,
        },
        { ignoreChecks: true }
      );

      return {
        swapCallData: (params as TransactionParams).data,
        augustus: (params as TransactionParams).to,
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
  const { paraswap, feeTarget } = getParaswap(chainId);

  const getRate = async (
    amount: string,
    srcToken: string,
    srcDecimals: number,
    destToken: string,
    destDecimals: number,
    userAddress: string,
    options: RateOptions
  ) => {
    const priceRoute = await paraswap.getRate({
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
    try {
      const params = await paraswap.buildTx(
        {
          srcToken,
          destToken,
          destAmount: route.destAmount,
          slippage: maxSlippage * 100,
          priceRoute: route,
          userAddress: user,
          partnerAddress: feeTarget,
          takeSurplus: true,
          srcDecimals,
          destDecimals,
          isDirectFeeTransfer: true,
        },
        { ignoreChecks: true }
      );

      return {
        swapCallData: (params as TransactionParams).data,
        augustus: (params as TransactionParams).to,
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

export const maxInputAmountWithSlippage = (
  inputAmount: string,
  slippage: string,
  decimals: number
) => {
  if (inputAmount === '0') return '0';
  return valueToBigNumber(inputAmount)
    .multipliedBy(1 + Number(slippage) / 100)
    .toFixed(decimals);
};

export const minimumReceivedAfterSlippage = (
  outputAmount: string,
  slippage: string,
  decimals: number
) => {
  if (outputAmount === '0') return '0';
  return valueToBigNumber(outputAmount)
    .multipliedBy(1 - Number(slippage) / 100)
    .toFixed(decimals);
};
