import {
  AppDataParams,
  // AppDataRootSchema,
  getOrderToSign,
  LimitTradeParameters,
  OrderKind,
  OrderSigningUtils,
  SupportedChainId,
} from '@cowprotocol/cow-sdk';
import {
  AAVE_ADAPTER_FACTORY,
  AAVE_POOL_ADDRESS,
  AaveCollateralSwapSdk,
  AaveFlashLoanType,
  DEFAULT_HOOK_GAS_LIMIT,
  EncodedOrder,
  FlashLoanHint,
  FlashLoanHookAmounts,
  HASH_ZERO,
} from '@cowprotocol/sdk-flash-loans';
// import { normalize } from '@aave/math-utils';
import { zeroAddress } from 'viem';

import { COW_PARTNER_FEE, FLASH_LOAN_FEE_BPS } from '../../constants/cow.constants';
import { SwapProvider, SwapState, SwapType } from '../../types';
import { getCowFlashLoanSdk } from './env.helpers';

export const calculateInstanceAddress = async ({
  user,
  validTo,
  type,
  state,
}: {
  user: string;
  validTo: number;
  type: AaveFlashLoanType;
  state: SwapState;
}) => {
  if (!user) return;
  if (
    !state.sellAmountBigInt ||
    !state.buyAmountBigInt ||
    !state.sellAmountToken ||
    !state.buyAmountToken
  )
    return;

  const flashLoanSdk = await getCowFlashLoanSdk(state.chainId);
  const { sellAmount, buyAmount, sellToken, buyToken, side, slippageBps, partnerFee } = {
    sellAmount: state.sellAmountBigInt,
    sellToken: state.sellAmountToken,
    buyAmount: state.buyAmountBigInt,
    buyToken: state.buyAmountToken,
    side: state.processedSide,
    slippageBps: Number(state.slippage) * 100,
    partnerFee: COW_PARTNER_FEE(state.sellAmountToken.symbol, state.buyAmountToken.symbol),
  };

  const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
    flashLoanFeeBps: FLASH_LOAN_FEE_BPS,
    sellAmount: sellAmount,
  });

  const limitOrder: LimitTradeParameters = {
    sellToken: sellToken.underlyingAddress,
    sellTokenDecimals: sellToken.decimals,
    buyToken: buyToken.underlyingAddress,
    buyTokenDecimals: buyToken.decimals,
    sellAmount: sellAmountToSign.toString(),
    buyAmount: buyAmount.toString(),
    kind: side === 'buy' ? OrderKind.BUY : OrderKind.SELL,
    validTo,
    slippageBps,
    partnerFee,
  };

  const orderToSign = getOrderToSign(
    {
      chainId: state.chainId,
      from: user,
      networkCostsAmount: '0',
      isEthFlow: false,
      applyCostsSlippageAndFees: false,
    },
    limitOrder,
    HASH_ZERO
  );

  const encodedOrder: EncodedOrder = {
    ...OrderSigningUtils.encodeUnsignedOrder(orderToSign),
    appData: HASH_ZERO,
    validTo,
  };

  const hookAmounts: FlashLoanHookAmounts = {
    flashLoanAmount: sellAmount.toString(),
    flashLoanFeeAmount: flashLoanFeeAmount.toString(),
    sellAssetAmount: sellAmount.toString(),
    buyAssetAmount: buyAmount.toString(),
  };

  return await flashLoanSdk.getExpectedInstanceAddress(
    type,
    state.chainId,
    user as `0x${string}`,
    hookAmounts,
    encodedOrder
  );
};

export const calculateFlashLoanAmounts = (
  state: SwapState
): {
  flashLoanFeeAmount: bigint;
  finalSellAmount: bigint;
} => {
  const flashLoanSdk = new AaveCollateralSwapSdk();
  const sellAmount = state.sellAmountBigInt;

  console.log('[calculateFlashLoanAmounts] sellAmount', sellAmount);
  if (!sellAmount)
    return {
      flashLoanFeeAmount: BigInt(0),
      finalSellAmount: BigInt(0),
    };

  if (state.swapType === SwapType.Swap || state.provider !== SwapProvider.COW_PROTOCOL) {
    return {
      flashLoanFeeAmount: BigInt(0),
      finalSellAmount: sellAmount,
    };
  }

  const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
    sellAmount: sellAmount,
    flashLoanFeeBps: FLASH_LOAN_FEE_BPS,
  });

  return {
    flashLoanFeeAmount,
    finalSellAmount: sellAmountToSign,
  };
};

/**
 * This helper function is used to get the app data for a quote from the CowSwap API when adapters are used
 * The goal is to let the solvers know that a flash loan is being used so the quote contemplates the higher gas costs
 * and therefore the quote is more precise and more chances of being executed
 * It's important to send the hooks and flashloan hint but not the exact amounts that will be used in the final
 */
export const getAppDataForQuote = async ({
  // user,
  type,
  amount,
  chainId,
  srcToken,
}: // srcDecimals,
// destToken,
// destDecimals,
{
  user: string;
  type: SwapType;
  amount: string;
  chainId: SupportedChainId;
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  destDecimals: number;
}): Promise<AppDataParams | undefined> => {
  if (type === SwapType.Swap || type === SwapType.WithdrawAndSwap) {
    return undefined; // no flashloan needed - plain swap
  }

  // const flashLoanSdk = new AaveCollateralSwapSdk();
  // const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
  //   sellAmount: BigInt(normalize(amount, -srcDecimals)),
  //   flashLoanFeeBps: FLASH_LOAN_FEE_BPS,
  // });

  // let cowType: AaveFlashLoanType;
  // if (type === SwapType.CollateralSwap) {
  //   cowType = AaveFlashLoanType.CollateralSwap;
  // } else if (type === SwapType.DebtSwap) {
  //   cowType = AaveFlashLoanType.DebtSwap;
  // } else  if(type === SwapType.RepayWithCollateral) {
  //   cowType = AaveFlashLoanType.RepayCollateral;
  // } else {
  //   throw new Error('Invalid swap type');
  // }

  // const hookAmounts: FlashLoanHookAmounts = {
  //     flashLoanAmount: amount,
  //     flashLoanFeeAmount: flashLoanFeeAmount.toString(),
  //     sellAssetAmount: sellAmountToSign.toString(),
  //     buyAssetAmount: amount,
  // }

  const flashloan: FlashLoanHint = {
    amount, // this is actually in UNDERLYING but aave tokens are 1:1
    receiver: AAVE_ADAPTER_FACTORY[chainId],
    liquidityProvider: AAVE_POOL_ADDRESS[chainId],
    protocolAdapter: AAVE_ADAPTER_FACTORY[chainId],
    token: srcToken,
  };

  // const limitOrder: LimitTradeParameters = {
  //   kind: OrderKind.SELL,
  //   sellToken: srcToken,
  //   sellTokenDecimals: srcDecimals,
  //   buyToken: destToken,
  //   buyTokenDecimals: destDecimals,
  //   sellAmount: normalize(amount, -srcDecimals).toString(),
  //   buyAmount: amount,
  // }

  // const orderToSign = getOrderToSign(
  //   {
  //     chainId,
  //     from: user,
  //     networkCostsAmount: '0',
  //     isEthFlow: false,
  //     applyCostsSlippageAndFees: false,
  //   },
  //   limitOrder,
  //   HASH_ZERO
  // );

  // const encodedOrder: EncodedOrder = {
  //   ...OrderSigningUtils.encodeUnsignedOrder(orderToSign),
  //   appData: HASH_ZERO,
  // }

  // const hooks = await getOrderHooks(
  //   cowType,
  //   chainId,
  //   user as `0x${string}`,
  //   zeroAddress,
  //   hookAmounts,
  //   {
  //     ...encodedOrder,
  //     receiver: zeroAddress,
  //   },
  // );

  // TODO: send proper calldatas when available so solvers can properly simulate
  const hooks = {
    pre: [
      {
        target: AAVE_ADAPTER_FACTORY[chainId],
        callData: '0x',
        gasLimit: DEFAULT_HOOK_GAS_LIMIT.pre.toString(),
        dappId: '',
      },
    ],
    post: [
      {
        target: zeroAddress,
        callData: '0x',
        gasLimit: DEFAULT_HOOK_GAS_LIMIT.post.toString(),
        dappId: '',
      },
    ],
  };

  return {
    metadata: {
      flashloan,
      hooks,
    },
  };
};
