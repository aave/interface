import {
  getOrderToSign,
  LimitTradeParameters,
  OrderKind,
  OrderSigningUtils,
} from '@cowprotocol/cow-sdk';
import {
  AaveCollateralSwapSdk,
  AaveFlashLoanType,
  EncodedOrder,
  FlashLoanHookAmounts,
  HASH_ZERO,
} from '@cowprotocol/sdk-flash-loans';

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
