import { normalize } from '@aave/math-utils';
import {
  getOrderToSign,
  LimitTradeParameters,
  OrderKind,
  OrderSigningUtils,
} from '@cowprotocol/cow-sdk';
import {
  AaveCollateralSwapSdk,
  EncodedOrder,
  FlashLoanHookAmounts,
  HASH_ZERO,
} from '@cowprotocol/sdk-flash-loans';

import { COW_PARTNER_FEE, FLASH_LOAN_FEE_BPS } from '../../constants/cow.constants';
import { OrderType, SwapProvider, SwapState, SwapType } from '../../types';

export const calculateInstanceAddress = async (state: SwapState, user: string, validTo: number) => {
  if (!state.minimumReceived || !user) return;

  const flashLoanSdk = new AaveCollateralSwapSdk();
  const sellAmount = normalize(state.inputAmount, -state.sourceToken.decimals);
  const buyAmount = normalize(state.minimumReceived, -state.destinationToken.decimals);
  const partnerFee = COW_PARTNER_FEE(state.sourceToken.symbol, state.destinationToken.symbol);
  const slippageBps =
    state.orderType === OrderType.LIMIT ? 0 : Math.round(Number(state.slippage) * 100); // percent to bps

  const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
    flashLoanFeePercent: FLASH_LOAN_FEE_BPS / 100,
    sellAmount: BigInt(sellAmount),
  });

  const limitOrder: LimitTradeParameters = {
    sellToken: state.sourceToken.underlyingAddress,
    sellTokenDecimals: state.sourceToken.decimals,
    buyToken: state.destinationToken.underlyingAddress,
    buyTokenDecimals: state.destinationToken.decimals,
    sellAmount: sellAmountToSign.toString(),
    buyAmount: buyAmount.toString(),
    kind: state.side === 'buy' ? OrderKind.BUY : OrderKind.SELL,
    validTo,
    slippageBps,
    partnerFee,
  };

  const orderToSign = getOrderToSign(
    { chainId: state.chainId, from: user, networkCostsAmount: '0', isEthFlow: false },
    limitOrder,
    HASH_ZERO
  );

  const encodedOrder: EncodedOrder = {
    ...OrderSigningUtils.encodeUnsignedOrder(orderToSign),
    appData: HASH_ZERO,
    validTo,
  };

  const hookAmounts: FlashLoanHookAmounts = {
    flashLoanAmount: sellAmount,
    flashLoanFeeAmount: flashLoanFeeAmount.toString(),
    sellAssetAmount: sellAmount,
    buyAssetAmount: buyAmount.toString(),
  };

  return await flashLoanSdk.getExpectedInstanceAddress(
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
  const sellAmount = normalize(state.inputAmount, -state.sourceToken.decimals);

  if (state.swapType !== SwapType.CollateralSwap || state.provider !== SwapProvider.COW_PROTOCOL) {
    return {
      flashLoanFeeAmount: BigInt(0),
      finalSellAmount: BigInt(sellAmount),
    };
  }

  const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
    sellAmount: BigInt(sellAmount),
    flashLoanFeePercent: FLASH_LOAN_FEE_BPS / 100,
  });

  return {
    flashLoanFeeAmount: flashLoanFeeAmount,
    finalSellAmount: sellAmountToSign,
  };
};
