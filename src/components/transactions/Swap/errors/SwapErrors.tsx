import React, { Dispatch, useEffect } from 'react';

import { useModalContext } from '../../../../hooks/useModal';
import { TrackAnalyticsHandlers } from '../analytics/useTrackAnalytics';
import { SwapError, SwapParams, SwapState } from '../types';
import { BalanceLowerThanInput } from './shared/BalanceLowerThanInput';
import { errorToConsole } from './shared/console.helpers';
import { GasEstimationError } from './shared/GasEstimationError';
import { GenericError } from './shared/GenericError';
import { ProviderError } from './shared/ProviderError';
import { hasUserDenied, UserDenied } from './shared/UserDenied';

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
        errors: [...(state.errors ?? []), swapError],
      });
      trackingHandlers.trackSwapError(swapError);
      console.error(errorToConsole(state, txError));
    }
  }, [txError]);

  if (Number(state.debouncedInputAmount) > Number(state.sourceToken.balance)) {
    return <BalanceLowerThanInput sx={{ mb: !state.isSwapFlowSelected ? 0 : 4 }} />;
  }

  const provider = state.swapRate?.provider;
  if (!provider) {
    return (
      <GenericError
        sx={{ mb: !state.isSwapFlowSelected ? 0 : 4 }}
        message="There was an issue fetching rates."
      />
    );
  }

  // For each error we try to parse per provider, or show GasEstimationError otherwise.
  return state.errors.map((error, idx) => {
    if (hasUserDenied(error)) {
      return <UserDenied key={`user-denied-${idx}`} />;
    }

    const providerError = React.createElement(ProviderError, {
      error: error.rawError,
      provider,
      sx: { mb: !state.isSwapFlowSelected ? 0 : 4 },
      key: `provider-error-${idx}`,
    });

    if (providerError) {
      return providerError;
    }

    return <GasEstimationError key={`gas-estimation-error-${idx}`} error={error.rawError} />;
  });
};
