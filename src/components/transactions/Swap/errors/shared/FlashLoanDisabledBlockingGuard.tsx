import { SxProps } from '@mui/material';
import { Dispatch, useEffect } from 'react';

import { ActionsBlockedReason, SwapError, SwapState } from '../../types';
import { isProtocolSwapState, ProtocolSwapState } from '../../types/state.types';
import { FlashLoanDisabledBlockingError } from './FlashLoanDisabledBlockingError';

export const hasFlashLoanDisabled = (state: SwapState): boolean => {
  if (!isProtocolSwapState(state)) {
    return false;
  }

  const reserve = !state.isInvertedSwap
    ? state.sourceReserve?.reserve
    : state.destinationReserve?.reserve;

  if (state.useFlashloan === true && reserve && !reserve.flashLoanEnabled) {
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

      if (!isAlreadyBlockingError) {
        const blockingError: SwapError = {
          rawError: new Error('FlashLoanDisabledError'),
          message: 'Position Swaps disabled for this asset',
          actionBlocked: true,
        };
        setState({
          error: blockingError,
          actionsBlocked: {
            [ActionsBlockedReason.FLASH_LOAN_DISABLED]: true,
          },
        });
      }
    } else {
      const isBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'FlashLoanDisabledError';
      if (isBlockingError) {
        setState({
          error: undefined,
          actionsBlocked: {
            [ActionsBlockedReason.FLASH_LOAN_DISABLED]: undefined,
          },
        });
      }
    }
  }, [
    state.provider,
    state.useFlashloan,
    state.sourceReserve?.reserve?.flashLoanEnabled,
    state.error,
  ]);

  if (hasFlashLoanDisabled(state)) {
    return <FlashLoanDisabledBlockingError sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />;
  }

  return null;
};
