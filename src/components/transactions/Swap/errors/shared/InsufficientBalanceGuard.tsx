import { SxProps } from '@mui/material';
import React, { Dispatch, useEffect } from 'react';

import { SwapError, SwapState } from '../../types';
import { BalanceLowerThanInput } from './BalanceLowerThanInput';

export const hasInsufficientBalance = (state: SwapState) => {
  return Number(state.debouncedInputAmount) > Number(state.sourceToken.balance);
};

export const InsufficientBalanceGuard = ({
  state,
  setState,
  sx,
  isSwapFlowSelected,
}: {
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  sx?: SxProps;
  isSwapFlowSelected: boolean;
}) => {
  useEffect(() => {
    const hasInsufficientBalance =
      Number(state.debouncedInputAmount) > Number(state.sourceToken.balance);

    if (hasInsufficientBalance) {
      const isAlreadyBalanceError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'BalanceLowerThanInput';

      if (!isAlreadyBalanceError || !state.actionsBlocked) {
        const balanceError: SwapError = {
          rawError: new Error('BalanceLowerThanInput'),
          message: 'Your balance is lower than the selected amount.',
          actionBlocked: true,
        };
        setState({ error: balanceError, actionsBlocked: true });
      }
    } else {
      const isBalanceError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'BalanceLowerThanInput';
      if (isBalanceError) {
        setState({ error: undefined, actionsBlocked: false });
      } else if (state.actionsBlocked && !state.error?.actionBlocked) {
        setState({ actionsBlocked: false });
      }
    }
  }, [state.debouncedInputAmount, state.sourceToken.balance]);

  if (Number(state.debouncedInputAmount) > Number(state.sourceToken.balance)) {
    return <BalanceLowerThanInput sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />;
  }

  return null;
};
