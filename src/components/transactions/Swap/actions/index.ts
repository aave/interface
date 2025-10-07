import React, { Dispatch } from 'react';

import { TrackAnalyticsHandlers } from '../analytics/useTrackAnalytics';
import {
  isProtocolSwapParams,
  isProtocolSwapState,
  isTokensSwapParams,
  isTokensSwapState,
  SwapParams,
  SwapState,
  SwapType,
} from '../types';
import { ActionsBlocked } from './ActionsBlocked';
import { ActionsLoading } from './ActionsSkeleton';
import { CollateralSwapActions } from './CollateralSwap/CollateralSwapActions';
import { DebtSwapActions } from './DebtSwap/DebtSwapActions';
import { RepayWithCollateralActions } from './RepayWithCollateral/RepayWithCollateralActions';
import { SwapActions } from './SwapActions';
import { WithdrawAndSwapActions } from './WithdrawAndSwap/WithdrawAndSwapActions';

export const BaseSwapActions = ({
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
  if (state.ratesLoading || state.actionsLoading || !state.isSwapFlowSelected) {
    return React.createElement(ActionsLoading, { state });
  }

  if (state.error?.actionBlocked || !state.swapRate) {
    return React.createElement(ActionsBlocked, { state });
  }

  if (params.swapType === SwapType.Swap && isTokensSwapParams(params) && isTokensSwapState(state)) {
    return React.createElement(SwapActions, { params, state, setState, trackingHandlers });
  } else if (isProtocolSwapParams(params) && isProtocolSwapState(state)) {
    switch (params.swapType) {
      case SwapType.CollateralSwap:
        return React.createElement(CollateralSwapActions, {
          params,
          state,
          setState,
          trackingHandlers,
        });
      case SwapType.DebtSwap:
        return React.createElement(DebtSwapActions, { params, state, setState, trackingHandlers });
      case SwapType.RepayWithCollateral:
        return React.createElement(RepayWithCollateralActions, {
          params,
          state,
          setState,
          trackingHandlers,
        });
      case SwapType.WithdrawAndSwap:
        return React.createElement(WithdrawAndSwapActions, {
          params,
          state,
          setState,
          trackingHandlers,
        });
      default:
        console.error(`Unsupported swap type`);
        return null;
    }
  } else {
    console.error(`Invalid swap params or state in actions`);
    return null;
  }
};
