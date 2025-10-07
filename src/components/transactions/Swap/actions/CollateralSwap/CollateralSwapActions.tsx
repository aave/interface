import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { ProtocolSwapParams, ProtocolSwapState, SwapProvider, SwapState } from '../../types';
import { SwapActionsViaCoW } from '../SwapActions/SwapActionsViaCoW';
import { SwapActionsViaParaswap } from '../SwapActions/SwapActionsViaParaswap';
import { CollateralSwapActionsViaCowAdapters } from './CollateralSwapActionsViaCoWAdapters';
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
  switch (state.swapRate?.provider) {
    case SwapProvider.COW_PROTOCOL:
      if (state.useFlashloan) {
        return (
          <CollateralSwapActionsViaCowAdapters
            params={params}
            state={state}
            trackingHandlers={trackingHandlers}
          />
        );
      } else {
        // Essentially traditional aTokens swap
        return (
          <SwapActionsViaCoW
            params={params}
            state={state}
            setState={setState}
            trackingHandlers={trackingHandlers}
          />
        );
      }
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
