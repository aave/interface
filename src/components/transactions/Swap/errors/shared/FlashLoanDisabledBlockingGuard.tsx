import { SxProps } from '@mui/material';
import { Dispatch, useEffect } from 'react';

import { SwapError, SwapProvider, SwapState } from '../../types';
import { isProtocolSwapState, ProtocolSwapState } from '../../types/state.types';
import { FlashLoanDisabledBlockingError } from './FlashLoanDisabledBlockingError';

export const hasFlashLoanDisabled = (state: SwapState): boolean => {
  if (!isProtocolSwapState(state)) {
    return false;
  }

  // Check if provider is Paraswap, using flashloan, and sourceReserve exists
  if (
    state.provider === SwapProvider.PARASWAP &&
    state.useFlashloan === true &&
    state.sourceReserve?.reserve &&
    !state.sourceReserve.reserve.flashLoanEnabled
  ) {
    return true;
  }

  return false;
};

export const FlashLoanDisabledBlockingGuard = ({
  state,
  setState,
  sx,
  isSwapFlowSelected,
}: {
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  sx?: SxProps;
  isSwapFlowSelected: boolean;
}) => {
  useEffect(() => {
    const isBlocking = hasFlashLoanDisabled(state);

    if (isBlocking) {
      const isAlreadyBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'FlashLoanDisabledError';

      if (!isAlreadyBlockingError || !state.actionsBlocked) {
        const blockingError: SwapError = {
          rawError: new Error('FlashLoanDisabledError'),
          message: 'Position Swaps disabled for this asset',
          actionBlocked: true,
        };
        setState({ error: blockingError, actionsBlocked: true });
      }
    } else {
      const isBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'FlashLoanDisabledError';
      if (isBlockingError) {
        setState({ error: undefined, actionsBlocked: false });
      } else if (state.actionsBlocked && !state.error?.actionBlocked) {
        setState({ actionsBlocked: false });
      }
    }
  }, [
    state.provider,
    state.useFlashloan,
    state.sourceReserve?.reserve?.flashLoanEnabled,
    state.error,
    state.actionsBlocked,
  ]);

  if (hasFlashLoanDisabled(state)) {
    return <FlashLoanDisabledBlockingError sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />;
  }

  return null;
};
