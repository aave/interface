import { SxProps } from '@mui/material';
import { Dispatch, useEffect } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import {
  ActionsBlockedReason,
  ProtocolSwapState,
  SwapError,
  SwapState,
  SwapType,
} from '../../types';
import { InsufficientBorrowPowerBlockingError } from './InsufficientBorrowPowerBlockingError';

export const hasInsufficientBorrowPower = (state: SwapState, availableBorrowsUSD?: string) => {
  if (state.swapType !== SwapType.DebtSwap) return false;

  const buyAmount = state.buyAmountFormatted;
  const sellAmount = state.sellAmountFormatted;
  const sourceReserve = state.sourceReserve?.reserve;
  const destinationReserve = state.destinationReserve?.reserve;
  if (!buyAmount || !sellAmount || !sourceReserve || !destinationReserve) return false;

  const repayUsd = Number(buyAmount) * Number(sourceReserve.priceInUSD);
  const newDebtUsd = Number(sellAmount) * Number(destinationReserve.priceInUSD);
  const priceImpactDifference = newDebtUsd - repayUsd;

  const available = Number(availableBorrowsUSD || '0');

  return available === 0 || priceImpactDifference > available;
};

export const InsufficientBorrowPowerBlockingGuard = ({
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
  const { user: extendedUser } = useAppDataContext();

  useEffect(() => {
    const isBlocking = hasInsufficientBorrowPower(state, extendedUser?.availableBorrowsUSD);

    if (isBlocking) {
      const isAlreadyBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'InsufficientBorrowPowerError';

      if (!isAlreadyBlockingError) {
        const blockingError: SwapError = {
          rawError: new Error('InsufficientBorrowPowerError'),
          message:
            'Insufficient collateral to cover new borrow position. Wallet must have borrowing power remaining to perform debt switch.',
          actionBlocked: true,
        };
        setState({
          error: blockingError,
          actionsBlocked: {
            [ActionsBlockedReason.INSUFFICIENT_BORROW_POWER]: true,
          },
        });
      }
    } else {
      const isBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'InsufficientBorrowPowerError';
      const isBorrowPowerBlocked =
        state.actionsBlocked?.[ActionsBlockedReason.INSUFFICIENT_BORROW_POWER];
      if (isBlockingError || isBorrowPowerBlocked) {
        setState({
          ...(isBlockingError ? { error: undefined } : {}),
          actionsBlocked: {
            [ActionsBlockedReason.INSUFFICIENT_BORROW_POWER]: undefined,
          },
        });
      }
    }
  }, [
    state.sellAmountFormatted,
    state.buyAmountFormatted,
    state.destinationReserve?.reserve?.priceInUSD,
    state.sourceReserve?.reserve?.priceInUSD,
    extendedUser?.availableBorrowsUSD,
    state.error,
    state.actionsBlocked,
  ]);

  if (hasInsufficientBorrowPower(state, extendedUser?.availableBorrowsUSD)) {
    return <InsufficientBorrowPowerBlockingError sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />;
  }

  return null;
};
