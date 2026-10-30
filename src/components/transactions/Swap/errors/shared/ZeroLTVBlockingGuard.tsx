import { SxProps } from '@mui/material';
import React, { Dispatch, useEffect } from 'react';
import { useZeroLTVBlockingWithdraw } from 'src/hooks/useZeroLTVBlockingWithdraw';

import { ActionsBlockedReason, SwapError, SwapState, SwapType } from '../../types';
import { isProtocolSwapState } from '../../types/state.types';
import { ZeroLTVBlockingError } from './ZeroLTVBlockingError';

// The cow-swap-adapter withdraws `_sellToken` (see
// cow-swap-adapters/src/adapters/v3/*Adapter.sol): the collateral picked as
// "Using" on repay with collateral, the source collateral otherwise. Read it from
// the selected reserve, which is known before any quote, and use the reserve
// symbol (WETH) rather than the token symbol, which can be the native one (ETH).
const getWithdrawnReserveSymbol = (state: SwapState) => {
  if (!isProtocolSwapState(state)) return undefined;
  const withdrawnReserve =
    state.swapType === SwapType.RepayWithCollateral
      ? state.destinationReserve
      : state.sourceReserve;
  return withdrawnReserve?.reserve.symbol;
};

// Mirrors `validateHFAndLtvzero` in aave-v3-origin SupplyLogic: when the user
// has any zero-LTV collateral enabled, every withdrawn aToken must itself have
// zero LTV.
export const hasZeroLTVBlocking = (state: SwapState, blockingAssets: string[]) => {
  if (blockingAssets.length === 0) return false;
  // Direct DEX swaps don't touch Aave; the on-chain check never runs.
  if (state.swapType === SwapType.Swap) return false;
  // DebtSwap repays old debt and opens new debt. Neither path withdraws an
  // aToken from the user, so validateHFAndLtvzero never fires.
  if (state.swapType === SwapType.DebtSwap) return false;

  const withdrawnSymbol = getWithdrawnReserveSymbol(state);
  // Conservative: if we can't identify the withdrawn asset yet, block.
  if (!withdrawnSymbol) return true;
  // Withdrawing the LTV=0 asset itself is allowed by the protocol.
  return !blockingAssets.includes(withdrawnSymbol);
};

export const ZeroLTVBlockingGuard = ({
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
  const assetsBlockingWithdraw = useZeroLTVBlockingWithdraw();
  const withdrawnSymbol = getWithdrawnReserveSymbol(state);

  useEffect(() => {
    const isBlocking = hasZeroLTVBlocking(state, assetsBlockingWithdraw);

    if (isBlocking) {
      const isAlreadyBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'ZeroLTVBlockingError';

      if (!isAlreadyBlockingError) {
        const blockingError: SwapError = {
          rawError: new Error('ZeroLTVBlockingError'),
          message:
            'You have assets with zero LTV that are blocking this operation. Please withdraw them or disable them as collateral first.',
          actionBlocked: true,
        };
        setState({
          error: blockingError,
          actionsBlocked: {
            [ActionsBlockedReason.ZERO_LTV_BLOCKING]: true,
          },
        });
      }
    } else {
      const isBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'ZeroLTVBlockingError';
      if (isBlockingError) {
        setState({
          error: undefined,
          actionsBlocked: {
            [ActionsBlockedReason.ZERO_LTV_BLOCKING]: undefined,
          },
        });
      }
    }
  }, [assetsBlockingWithdraw, withdrawnSymbol, state.swapType]);

  if (hasZeroLTVBlocking(state, assetsBlockingWithdraw)) {
    return <ZeroLTVBlockingError sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />;
  }

  return null;
};
