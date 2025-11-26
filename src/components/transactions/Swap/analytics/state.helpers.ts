import { TrackEventProperties } from 'src/store/analyticsSlice';

import { isCowProtocolRates, SwapError, SwapQuoteType, SwapState } from '../types';
import { SwapInputChanges } from './constants';

export const swapStateToAnalyticsEventParams = (state: SwapState): TrackEventProperties => {
  return {
    // UI inputs info
    chainId: state.chainId,
    inputSymbol: state.sourceToken.symbol,
    outputSymbol: state.destinationToken.symbol,
    inputAmount: state.inputAmount,
    inputAmountUSD: state.swapRate?.srcSpotUSD,
    outputAmount: state.outputAmount,
    outputAmountUSD: state.swapRate?.destSpotUSD,
    slippage: state.slippage,

    // Swap Order info
    sellAmountFormatted: state.sellAmountFormatted,
    sellAmountBigInt: state.sellAmountBigInt?.toString() ?? '',
    sellAmountToken: state.sellAmountToken?.symbol ?? '',
    buyAmountFormatted: state.buyAmountFormatted,
    buyAmountBigInt: state.buyAmountBigInt?.toString() ?? '',
    buyAmountToken: state.buyAmountToken?.symbol ?? '',
    isInvertedSwap: state.isInvertedSwap,

    // Swap context info
    provider: state.provider,
    expiry: state.expiry,
    orderType: state.orderType,
    gasLimit: state.gasLimit,
    shouldUseFlashloan: state.useFlashloan,
    useFlashloan: state.useFlashloan,
    swapType: state.swapType,
    txHash: state.mainTxState.txHash,
    isMaxSelected: state.isMaxSelected,
    pair: `${state.sourceToken.symbol}-${state.destinationToken.symbol}`,
    side: state.side,
    userIsSmartContractWallet: state.userIsSmartContractWallet,
    userIsSafeWallet: state.userIsSafeWallet,
  };
};

export const swapErrorToAnalyticsEventParams = (error: SwapError): TrackEventProperties => {
  return {
    errorMessage: error.message,
    isActionBlocked: error.actionBlocked,
    stage: error.stage,
  };
};

export const swapQuoteToAnalyticsEventParams = (
  state: SwapState,
  swapQuote: SwapQuoteType
): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),

    quoteProvider: swapQuote.provider,
    quoteSrcAmount: swapQuote.srcSpotAmount,
    quoteSrcUSD: swapQuote.srcSpotUSD,
    quoteDestAmount: swapQuote.destSpotAmount,
    quoteDestUSD: swapQuote.destSpotUSD,
    quoteSuggestedSlippage: swapQuote.suggestedSlippage,
    ...(isCowProtocolRates(swapQuote)
      ? {
          quoteQuoteId: swapQuote.quoteId,
        }
      : {
          // any?
        }),
  };
};

export const swapInputChangeToAnalyticsEventParams = (
  state: SwapState,
  fieldChange: SwapInputChanges,
  newValue: string
): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),
    fieldChange,
    newValue,
  };
};

export const swapTrackApprovalToAnalyticsEventParams = (
  state: SwapState,
  approvalAmount: string,
  viaPermit: boolean
): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),
    approvalAmount,
    viaPermit,
  };
};

export const swapTrackSwapToAnalyticsEventParams = (state: SwapState): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),
  };
};

export const swapTrackSwapFilledToAnalyticsEventParams = (
  state: SwapState,
  executedSellAmount: string,
  executedBuyAmount: string
): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),
    executedSellAmount,
    executedSellAmountUSD: state.swapRate?.srcSpotUSD,
    executedBuyAmount,
    executedBuyAmountUSD: state.swapRate?.destSpotUSD,
  };
};

export const swapTrackSwapFailedToAnalyticsEventParams = (
  state: SwapState,
  reason?: string
): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),
    ...(reason
      ? { errorReason: String(reason).slice(0, 160) }
      : state.error?.message
      ? { errorReason: String(state.error.message).slice(0, 160) }
      : {}),
  };
};

export const swapUserDeniedToAnalyticsEventParams = (state: SwapState): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),
  };
};

export const swapTrackGasEstimationErrorToAnalyticsEventParams = (
  state: SwapState
): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),
    errorMessage: 'Gas estimation error',
  };
};
