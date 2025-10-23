import { BigNumberValue, normalize } from '@aave/math-utils';
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

import { FLASH_LOAN_FEE_BPS } from '../../constants/cow.constants';
import { SwappableToken, SwapProvider, SwapState, SwapType } from '../../types';
import { getCowFlashLoanSdk } from './env.helpers';

export type OrderCore = {
  chainId: number;
  sellAmount: BigNumberValue;
  buyAmount: BigNumberValue;
  sellToken: SwappableToken;
  buyToken: SwappableToken;
  side: 'buy' | 'sell';
  slippageBps: number;
  partnerFee: {
    volumeBps: number;
    recipient: string;
  };
};

export const calculateInstanceAddress = async ({
  user,
  validTo,
  type,
  orderCore,
}: {
  user: string;
  validTo: number;
  type: AaveFlashLoanType;
  orderCore: OrderCore;
}) => {
  if (!user) return;
  const flashLoanSdk = await getCowFlashLoanSdk(orderCore.chainId);
  const { sellAmount, buyAmount, sellToken, buyToken, side, slippageBps, partnerFee } = orderCore;

  const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
    flashLoanFeeBps: FLASH_LOAN_FEE_BPS,
    sellAmount: BigInt(sellAmount.toString()),
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
    { chainId: orderCore.chainId, from: user, networkCostsAmount: '0', isEthFlow: false },
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
    orderCore.chainId,
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

  if (state.swapType === SwapType.Swap || state.provider !== SwapProvider.COW_PROTOCOL) {
    return {
      flashLoanFeeAmount: BigInt(0),
      finalSellAmount: BigInt(sellAmount),
    };
  }

  const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
    sellAmount: BigInt(sellAmount),
    flashLoanFeeBps: FLASH_LOAN_FEE_BPS,
  });

  return {
    flashLoanFeeAmount,
    finalSellAmount: sellAmountToSign,
  };
};
