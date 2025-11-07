import { valueToBigNumber } from '@aave/math-utils';
import { SxProps } from '@mui/material';
import React, { Dispatch, useEffect } from 'react';

import { SwapError, SwapState } from '../../types';
import { BalanceLowerThanInput } from './BalanceLowerThanInput';

export const hasInsufficientBalance = (state: SwapState) => {
  // Determine which token pays for the swap (handles inverted flows like RepayWithCollateral)
  const payingToken =
    state.sellAmountToken || (state.isInvertedSwap ? state.destinationToken : state.sourceToken);

  // Prefer the computed sell amount if available; otherwise derive from the edited side
  const requiredAmount =
    state.sellAmountFormatted ||
    (state.side === 'sell' ? state.debouncedInputAmount : state.debouncedOutputAmount);

  return valueToBigNumber(requiredAmount || 0).isGreaterThan(
    valueToBigNumber(payingToken.balance || 0)
  );
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
    const payingToken =
      state.sellAmountToken || (state.isInvertedSwap ? state.destinationToken : state.sourceToken);
    const requiredAmount =
      state.sellAmountFormatted ||
      (state.side === 'sell' ? state.debouncedInputAmount : state.debouncedOutputAmount);

    const hasInsufficientBalance = valueToBigNumber(requiredAmount || 0).isGreaterThan(
      valueToBigNumber(payingToken.balance || 0)
    );

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
  }, [
    state.debouncedInputAmount,
    state.debouncedOutputAmount,
    state.sourceToken.balance,
    state.destinationToken.balance,
    state.sellAmountFormatted,
    state.isInvertedSwap,
    state.side,
  ]);

  const payingToken =
    state.sellAmountToken || (state.isInvertedSwap ? state.destinationToken : state.sourceToken);
  const requiredAmount =
    state.sellAmountFormatted ||
    (state.side === 'sell' ? state.debouncedInputAmount : state.debouncedOutputAmount);

  if (
    valueToBigNumber(requiredAmount || 0).isGreaterThan(valueToBigNumber(payingToken.balance || 0))
  ) {
    return <BalanceLowerThanInput sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />;
  }

  return null;
};
