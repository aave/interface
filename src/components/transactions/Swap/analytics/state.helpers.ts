import { TrackEventProperties } from 'src/store/analyticsSlice';

import { isCowProtocolRates, SwapError, SwapQuoteType, SwapState } from '../types';
import { SwapInputChanges } from './constants';

export const swapStateToAnalyticsEventParams = (state: SwapState): TrackEventProperties => {
  return {
    chainId: state.chainId,
    inputSymbol: state.sourceToken.symbol,
    outputSymbol: state.destinationToken.symbol,
    inputAmount: state.inputAmount,
    inputAmountUSD: state.swapRate?.srcUSD,
    outputAmount: state.outputAmount,
    outputAmountUSD: state.swapRate?.destUSD,
    slippage: state.slippage,
    provider: state.swapRate?.provider,
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
    quoteSrcAmount: swapQuote.srcAmount,
    quoteSrcUSD: swapQuote.srcUSD,
    quoteDestAmount: swapQuote.destAmount,
    quoteDestUSD: swapQuote.destUSD,
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
    executedSellAmountUSD: state.swapRate?.srcUSD,
    executedBuyAmount,
    executedBuyAmountUSD: state.swapRate?.destUSD,
  };
};

export const swapTrackSwapFailedToAnalyticsEventParams = (
  state: SwapState
): TrackEventProperties => {
  return {
    ...swapStateToAnalyticsEventParams(state),
  };
};
