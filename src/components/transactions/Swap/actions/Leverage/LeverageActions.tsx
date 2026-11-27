import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { ProtocolSwapParams, ProtocolSwapState, SwapProvider, SwapState } from '../../types';
import { PositionSwapActionsViaBackend } from '../PositionSwapActionsViaBackend';

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
  // Only the backend places a leverage; ParaSwap has no equivalent route.
  if (state.provider !== SwapProvider.COW_PROTOCOL) return null;

  return (
    <PositionSwapActionsViaBackend
      params={params}
      state={state}
      setState={setState}
      trackingHandlers={trackingHandlers}
    />
  );
};
