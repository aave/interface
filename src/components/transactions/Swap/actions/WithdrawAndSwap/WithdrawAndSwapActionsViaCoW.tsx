import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { ProtocolSwapParams, ProtocolSwapState, SwapState } from '../../types';
import { SwapActionsViaCoW } from '../SwapActions/SwapActionsViaCoW';

export const WithdrawAndSwapActionsViaCoW = ({
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
  // Essentially an aToken to token swap without a flashloan

  return (
    <SwapActionsViaCoW
      params={params}
      state={state}
      setState={setState}
      trackingHandlers={trackingHandlers}
    />
  );
};
