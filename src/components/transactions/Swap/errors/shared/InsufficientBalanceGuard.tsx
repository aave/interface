import { valueToBigNumber } from '@aave/math-utils';
import { SxProps } from '@mui/material';
import React, { Dispatch, useEffect } from 'react';

import { ActionsBlockedReason, SwapError, SwapState, SwapType } from '../../types';
import { BalanceLowerThanInput } from './BalanceLowerThanInput';

export const hasInsufficientBalance = (state: SwapState) => {
  // Determine which token pays and which amount to compare.
  // - Default: sell side pays.
  // - Inverted flows (e.g., RepayWithCollateral) use destination token.
  // - DebtSwap is special: the buy side pays (repaying with the bought debt token).
  const paysOnBuySide = state.swapType === SwapType.DebtSwap;
  const payingToken = paysOnBuySide ? state.buyAmountToken : state.sellAmountToken;

  const requiredAmount = paysOnBuySide ? state.buyAmountFormatted : state.sellAmountFormatted;

  return valueToBigNumber(requiredAmount || 0).isGreaterThan(
    valueToBigNumber(payingToken?.balance || 0)
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
    const insufficient = hasInsufficientBalance(state);

    if (insufficient) {
      const isAlreadyBalanceError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'BalanceLowerThanInput';

      if (!isAlreadyBalanceError) {
        const balanceError: SwapError = {
          rawError: new Error('BalanceLowerThanInput'),
          message: 'Your balance is lower than the selected amount.',
          actionBlocked: true,
        };
        setState({
          error: balanceError,
          actionsBlocked: {
            [ActionsBlockedReason.INSUFFICIENT_BALANCE]: true,
          },
        });
      }
    } else {
      const isBalanceError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'BalanceLowerThanInput';

      if (isBalanceError) {
        setState({
          error: undefined,
          actionsBlocked: {
            [ActionsBlockedReason.INSUFFICIENT_BALANCE]: undefined,
          },
        });
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
    state.swapType,
    state.buyAmountFormatted,
    state.sellAmountFormatted,
  ]);

  if (hasInsufficientBalance(state)) {
    return (
      <BalanceLowerThanInput
        sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }}
        swapType={state.swapType}
      />
    );
  }

  return null;
};
