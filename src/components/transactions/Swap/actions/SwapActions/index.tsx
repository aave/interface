import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { SwapParams, SwapProvider, SwapState } from '../../types';
import { SwapActionsViaBackend } from './SwapActionsViaBackend';
import { SwapActionsViaParaswap } from './SwapActionsViaParaswap';

export const SwapActions = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  switch (state.provider) {
    case SwapProvider.COW_PROTOCOL:
      return (
        <SwapActionsViaBackend
          params={params}
          state={state}
          setState={setState}
          trackingHandlers={trackingHandlers}
        />
      );
    case SwapProvider.PARASWAP:
      return (
        <SwapActionsViaParaswap
          params={params}
          state={state}
          setState={setState}
          trackingHandlers={trackingHandlers}
        />
      );
    default:
      return null;
  }
};
