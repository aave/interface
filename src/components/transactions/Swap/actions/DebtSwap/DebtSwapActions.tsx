import { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { ProtocolSwapParams, ProtocolSwapState, SwapProvider, SwapState } from '../../types';
import { DebtSwapActionsViaCoW } from './DebtSwapActionsViaCoW';
import { DebtSwapActionsViaParaswap } from './DebtSwapActionsViaParaswap';

export const DebtSwapActions = ({
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
      return (
        <DebtSwapActionsViaCoW
          params={params}
          state={state}
          setState={setState}
          trackingHandlers={trackingHandlers}
        />
      );
    case SwapProvider.PARASWAP:
      return (
        <DebtSwapActionsViaParaswap
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
