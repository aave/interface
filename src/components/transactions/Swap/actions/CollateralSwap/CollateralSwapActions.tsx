import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { ProtocolSwapParams, ProtocolSwapState, SwapProvider, SwapState } from '../../types';
import { PositionSwapActionsViaBackend } from '../PositionSwapActionsViaBackend';
import { SwapActionsViaParaswap } from '../SwapActions/SwapActionsViaParaswap';
import { CollateralSwapActionsViaParaswapAdapters } from './CollateralSwapActionsViaParaswapAdapters';

export const CollateralSwapActions = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  switch (state.provider) {
    case SwapProvider.COW_PROTOCOL:
      return (
        <PositionSwapActionsViaBackend
          params={params}
          state={state}
          setState={setState}
          trackingHandlers={trackingHandlers}
        />
      );
    case SwapProvider.PARASWAP:
      if (state.useFlashloan) {
        return (
          <CollateralSwapActionsViaParaswapAdapters
            params={params}
            state={state}
            setState={setState}
            trackingHandlers={trackingHandlers}
          />
        );
      } else {
        // Essentially traditional aTokens swap
        return (
          <SwapActionsViaParaswap
            params={params}
            state={state}
            setState={setState}
            trackingHandlers={trackingHandlers}
          />
        );
      }
  }
};
