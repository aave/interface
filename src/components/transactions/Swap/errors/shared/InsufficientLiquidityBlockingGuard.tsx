import { valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { SxProps } from '@mui/material';
import { Dispatch, useEffect } from 'react';

import { ProtocolSwapState, SwapError, SwapState } from '../../types';
import { InsufficientLiquidityBlockingError } from './InsufficientLiquidityBlockingError';

export const hasInsufficientLiquidity = (state: SwapState) => {
  if (!('destinationReserve' in state)) return false;
  const protocolState = state as ProtocolSwapState;
  const reserve = protocolState.destinationReserve?.reserve;
  const buyAmount = protocolState.buyAmountFormatted;
  if (!reserve || !buyAmount) return false;

  const availableBorrowCap =
    reserve.borrowCap === '0'
      ? valueToBigNumber(ethers.constants.MaxUint256.toString())
      : valueToBigNumber(reserve.borrowCap).minus(valueToBigNumber(reserve.totalDebt));
  const availableLiquidity = BigNumber.max(
    BigNumber.min(valueToBigNumber(reserve.formattedAvailableLiquidity), availableBorrowCap),
    0
  );

  return valueToBigNumber(buyAmount).gt(availableLiquidity);
};

export const InsufficientLiquidityBlockingGuard = ({
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
    const isBlocking = hasInsufficientLiquidity(state);

    if (isBlocking) {
      const isAlreadyBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'InsufficientLiquidityError';

      if (!isAlreadyBlockingError || !state.actionsBlocked) {
        const blockingError: SwapError = {
          rawError: new Error('InsufficientLiquidityError'),
          message: 'Not enough liquidity in target asset to complete the swap.',
          actionBlocked: true,
        };
        setState({ error: blockingError, actionsBlocked: true });
      }
    } else {
      const isBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'InsufficientLiquidityError';
      if (isBlockingError) {
        setState({ error: undefined, actionsBlocked: false });
      } else if (state.actionsBlocked && !state.error?.actionBlocked) {
        setState({ actionsBlocked: false });
      }
    }
  }, [state.buyAmountFormatted, state.destinationReserve?.reserve?.formattedAvailableLiquidity]);

  if (hasInsufficientLiquidity(state)) {
    const symbol = state.destinationReserve?.reserve?.symbol || '';
    return (
      <InsufficientLiquidityBlockingError
        symbol={symbol}
        sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }}
      />
    );
  }

  return null;
};


