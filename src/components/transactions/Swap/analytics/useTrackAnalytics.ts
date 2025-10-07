import { useRootStore } from 'src/store/root';

import { SwapError, SwapState } from '../types';
import { SWAP, SwapInputChanges } from './constants';
import {
  swapErrorToAnalyticsEventParams,
  swapInputChangeToAnalyticsEventParams,
  swapStateToAnalyticsEventParams,
  swapTrackApprovalToAnalyticsEventParams,
  swapTrackSwapFailedToAnalyticsEventParams,
  swapTrackSwapFilledToAnalyticsEventParams,
  swapTrackSwapToAnalyticsEventParams,
} from './state.helpers';

export type TrackAnalyticsHandlers = {
  trackSwapQuote: (isAutoRefreshed: boolean) => void;
  trackSwapError: (error: SwapError) => void;
  trackInputChange: (fieldChange: SwapInputChanges, newValue: string) => void;
  trackApproval: (approvalAmount: string, viaPermit: boolean) => void;
  trackSwap: () => void;
  trackSwapFilled: (executedSellAmount: string, executedBuyAmount: string) => void;
  trackSwapFailed: () => void;
};

/*
   This hook handles all analytics for the swap component.
   We track all the user journey through the swap component, including quote, input changes, errors, warnings, actions, etc.
*/
export const useHandleAnalytics = ({ state }: { state: SwapState }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return {
    trackSwapQuote: (isAutoRefreshed: boolean) =>
      trackEvent(
        isAutoRefreshed ? SWAP.QUOTE_REFRESHED : SWAP.QUOTE,
        swapStateToAnalyticsEventParams(state)
      ),
    trackSwapError: (error: SwapError) =>
      trackEvent(SWAP.ERROR, swapErrorToAnalyticsEventParams(error)),
    trackInputChange: (fieldChange: SwapInputChanges, newValue: string) =>
      trackEvent(
        SWAP.INPUT_CHANGES,
        swapInputChangeToAnalyticsEventParams(state, fieldChange, newValue)
      ),
    trackApproval: (approvalAmount: string, viaPermit: boolean) =>
      trackEvent(
        SWAP.APPROVAL,
        swapTrackApprovalToAnalyticsEventParams(state, approvalAmount, viaPermit)
      ),
    trackSwap: () => trackEvent(SWAP.SWAP, swapTrackSwapToAnalyticsEventParams(state)),
    trackSwapFilled: (executedSellAmount: string, executedBuyAmount: string) =>
      trackEvent(
        SWAP.SWAP_FILLED,
        swapTrackSwapFilledToAnalyticsEventParams(state, executedSellAmount, executedBuyAmount)
      ),
    trackSwapFailed: () =>
      trackEvent(SWAP.SWAP_FAILED, swapTrackSwapFailedToAnalyticsEventParams(state)),
  };
};
