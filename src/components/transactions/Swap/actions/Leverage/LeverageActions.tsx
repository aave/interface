import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { ProtocolSwapParams, ProtocolSwapState, SwapProvider, SwapState } from '../../types';
import { LeverageActionsViaCoW } from './LeverageActionsViaCoW';

export const LeverageActions = ({
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
  // Only the CoW adapters implement leverage; ParaSwap has no equivalent route.
  if (state.provider !== SwapProvider.COW_PROTOCOL) return null;

  return (
    <LeverageActionsViaCoW
      params={params}
      state={state}
      setState={setState}
      trackingHandlers={trackingHandlers}
    />
  );
};
