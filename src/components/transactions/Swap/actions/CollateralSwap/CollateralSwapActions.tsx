import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { ProtocolSwapParams, ProtocolSwapState, SwapProvider, SwapState } from '../../types';
import { SwapActionsViaCoW } from '../SwapActions/SwapActionsViaCoW';
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
  switch (state.provider) {
    case SwapProvider.COW_PROTOCOL:
      if (state.useFlashloan) {
        return (
          <CollateralSwapActionsViaCowAdapters
            params={params}
            state={state}
            setState={setState}
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
      // Paraswap can't swap aTokens directly, so always use the adapter. It runs swapAndDeposit
      // (no flashloan) or a flashloan based on state.useFlashloan, which useFlowSelector sets from
      // the health-factor impact.
      return (
        <CollateralSwapActionsViaParaswapAdapters
          params={params}
          state={state}
          setState={setState}
          trackingHandlers={trackingHandlers}
        />
      );
  }
};
