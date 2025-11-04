import { valueToBigNumber } from '@aave/math-utils';
import { SxProps } from '@mui/material';
import { Dispatch, useEffect } from 'react';

import { ProtocolSwapState, SwapError, SwapState } from '../../types';
import { SupplyCapBlockingError } from './SupplyCapBlockingError';

export const hasSupplyCapBlocking = (state: SwapState) => {
  if (!('destinationReserve' in state)) return false;
  const protocolState = state as ProtocolSwapState;
  const reserve = protocolState.destinationReserve?.reserve;
  const buyAmount = protocolState.buyAmountFormatted;
  if (!reserve || !buyAmount) return false;

  if (reserve.supplyCap === '0') return false;

  const remainingCap = valueToBigNumber(reserve.supplyCap).minus(
    valueToBigNumber(reserve.totalLiquidity)
  );

  // If remaining cap is exhausted or the intended buy exceeds remaining, block
  return remainingCap.lte(0) || valueToBigNumber(buyAmount).gt(remainingCap);
};

export const SupplyCapBlockingGuard = ({
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
    const isBlocking = hasSupplyCapBlocking(state);

    if (isBlocking) {
      const isAlreadyBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'SupplyCapBlockingError';

      if (!isAlreadyBlockingError || !state.actionsBlocked) {
        const blockingError: SwapError = {
          rawError: new Error('SupplyCapBlockingError'),
          message: 'Supply cap reached for target asset.',
          actionBlocked: true,
        };
        setState({ error: blockingError, actionsBlocked: true });
      }
    } else {
      const isBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'SupplyCapBlockingError';
      if (isBlockingError) {
        setState({ error: undefined, actionsBlocked: false });
      } else if (state.actionsBlocked && !state.error?.actionBlocked) {
        setState({ actionsBlocked: false });
      }
    }
  }, [state.buyAmountFormatted, state.destinationReserve?.reserve?.totalLiquidity]);

  if (hasSupplyCapBlocking(state)) {
    const symbol = state.destinationReserve?.reserve?.symbol || '';
    return (
      <SupplyCapBlockingError symbol={symbol} sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />
    );
  }

  return null;
};


