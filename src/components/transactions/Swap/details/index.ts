import React from 'react';

import {
  isProtocolSwapParams,
  isProtocolSwapState,
  isTokensSwapParams,
  isTokensSwapState,
  SwapParams,
  SwapState,
  SwapType,
} from '../types';
import { ColalteralSwapDetails } from './CollateralSwapDetails';
import { DebtSwapDetails } from './DebtSwapDetails';
import { DetailsSkeleton } from './DetailsSkeleton';
import { RepayWithCollateralDetails } from './RepayWithCollateralDetails';
import { SwapDetails } from './SwapDetails';
import { WithdrawAndSwapDetails } from './WithdrawAndSwapDetails';

export const BaseSwapDetails = ({ params, state }: { params: SwapParams; state: SwapState }) => {
  if (state.ratesLoading) {
    // TODO: any other loading state?
    return React.createElement(DetailsSkeleton, { state });
  }

  if (!state.swapRate) {
    return null;
  }

  if (params.swapType === SwapType.Swap && isTokensSwapParams(params) && isTokensSwapState(state)) {
    return React.createElement(SwapDetails, { params, state });
  } else if (isProtocolSwapParams(params) && isProtocolSwapState(state)) {
    switch (params.swapType) {
      case SwapType.CollateralSwap:
        return React.createElement(ColalteralSwapDetails, { params, state });
      case SwapType.DebtSwap:
        return React.createElement(DebtSwapDetails, { params, state });
      case SwapType.RepayWithCollateral:
        return React.createElement(RepayWithCollateralDetails, { params, state });
      case SwapType.WithdrawAndSwap:
        return React.createElement(WithdrawAndSwapDetails, { params, state });
      default:
        console.error(`Unsupported swap type`);
        return null;
    }
  } else {
    console.error(`Invalid swap params or state in details`);
    return null;
  }
};
