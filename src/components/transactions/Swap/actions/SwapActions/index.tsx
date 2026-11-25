import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { isSwapViaBackend } from '../../helpers/shared/provider.helpers';
import { SwapParams, SwapProvider, SwapState } from '../../types';
import { SwapActionsViaBackend } from './SwapActionsViaBackend';
import { SwapActionsViaCoW } from './SwapActionsViaCoW';
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
      return isSwapViaBackend(state.provider, params.swapType) ? (
        <SwapActionsViaBackend
          params={params}
          state={state}
          setState={setState}
          trackingHandlers={trackingHandlers}
        />
      ) : (
        <SwapActionsViaCoW
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
