import React, { Dispatch, useEffect } from 'react';

import { useModalContext } from '../../../../hooks/useModal';
import { TrackAnalyticsHandlers } from '../analytics/useTrackAnalytics';
import { SwapError, SwapParams, SwapState } from '../types';
import { isProtocolSwapState } from '../types/state.types';
import { errorToConsole } from './shared/console.helpers';
import {
  FlashLoanDisabledBlockingGuard,
  hasFlashLoanDisabled,
} from './shared/FlashLoanDisabledBlockingGuard';
import { GasEstimationError } from './shared/GasEstimationError';
import { GenericError } from './shared/GenericError';
import {
  hasInsufficientBalance,
  InsufficientBalanceGuard,
} from './shared/InsufficientBalanceGuard';
import {
  hasInsufficientLiquidity,
  InsufficientLiquidityBlockingGuard,
} from './shared/InsufficientLiquidityBlockingGuard';
import { ProviderError } from './shared/ProviderError';
import { hasSupplyCapBlocking, SupplyCapBlockingGuard } from './shared/SupplyCapBlockingGuard';
import { hasUserDenied, UserDenied } from './shared/UserDenied';
import { hasZeroLTVBlocking, ZeroLTVBlockingGuard } from './shared/ZeroLTVBlockingGuard';

export const SwapErrors = ({
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const { txError } = useModalContext();

  useEffect(() => {
    if (txError) {
      const swapError: SwapError = {
        rawError: txError.rawError,
        message: `Error: ${txError.error} on ${txError.txAction}`,
        actionBlocked: txError.actionBlocked || txError.blocking,
      };

      setState({
        error: swapError,
      });
      trackingHandlers.trackSwapError(swapError);

      // Human readable error for user to share with support team
      // Avoid wrapping in console.error to prevent dev overlay "undefined Error" noise
      errorToConsole(state, {
        rawError: txError.rawError,
        message: `Error: ${txError.error} on ${txError.txAction}`,
        actionBlocked: txError.actionBlocked || txError.blocking,
      });
    }
  }, [txError]);

  if (hasInsufficientBalance(state)) {
    return (
      <InsufficientBalanceGuard
        state={state}
        setState={setState}
        isSwapFlowSelected={state.isSwapFlowSelected}
      />
    );
  }

  if (hasZeroLTVBlocking(state, [])) {
    return (
      <ZeroLTVBlockingGuard
        state={state}
        setState={setState}
        isSwapFlowSelected={state.isSwapFlowSelected}
      />
    );
  }

  if (hasFlashLoanDisabled(state) && isProtocolSwapState(state)) {
    return (
      <FlashLoanDisabledBlockingGuard
        state={state}
        setState={setState}
        isSwapFlowSelected={state.isSwapFlowSelected}
      />
    );
  }

  if (isProtocolSwapState(state) && hasSupplyCapBlocking(state)) {
    return (
      <SupplyCapBlockingGuard
        state={state}
        setState={setState}
        isSwapFlowSelected={state.isSwapFlowSelected}
      />
    );
  }

  if (isProtocolSwapState(state) && hasInsufficientLiquidity(state)) {
    return (
      <InsufficientLiquidityBlockingGuard
        state={state}
        setState={setState}
        isSwapFlowSelected={state.isSwapFlowSelected}
      />
    );
  }

  if (!state.error) {
    return null;
  }

  if (hasUserDenied(state.error)) {
    return <UserDenied state={state} setState={setState} key={`user-denied`} />;
  }

  const provider = state.provider;
  if (!provider) {
    return (
      <GenericError
        sx={{ mb: !state.isSwapFlowSelected ? 0 : 4 }}
        message="There was an issue fetching rates."
      />
    );
  }

  const providerError = React.createElement(ProviderError, {
    error: state.error,
    state,
    provider,
    sx: { mb: !state.isSwapFlowSelected ? 0 : 4 },
    key: `provider-error`,
  });

  if (providerError) {
    return providerError;
  }

  return <GasEstimationError key={`gas-estimation-error`} error={state.error.rawError} />;
};
