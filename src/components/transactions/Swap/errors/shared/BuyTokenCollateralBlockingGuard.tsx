import { SxProps } from '@mui/material';
import React, { Dispatch, useEffect } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ActionsBlockedReason, SwapError, SwapState, SwapType } from '../../types';
import { BuyTokenCollateralBlockingError } from './BuyTokenCollateralBlockingError';

const BLOCKING_ERROR_MESSAGE = 'BuyTokenCollateralBlockingError';

/** Underlying address (lowercased) -> whether the user has it enabled as collateral. */
export const useCollateralEnabledByAddress = () => {
  const userReserves = useAppDataContext().user?.userReservesData;
  return new Map<string, boolean>(
    (userReserves ?? []).map((userReserve) => [
      userReserve.reserve.underlyingAsset.toLowerCase(),
      userReserve.usageAsCollateralEnabledOnUser,
    ])
  );
};

// `_enforceUsingAsCollateral(_buyToken, owner)` in the cow-swap-adapters V3 base adapter reverts
// the postHook with `BuyTokenNotUsingAsCollateral` unless the owner already uses the bought asset
// as collateral. Only the collateral swap and leverage adapters call it, so the other flows are
// unaffected. Checked here because the revert would otherwise surface as a failed settlement.
export const hasBuyTokenNotUsedAsCollateral = (
  state: SwapState,
  collateralEnabledByAddress: Map<string, boolean>
) => {
  if (state.swapType !== SwapType.CollateralSwap && state.swapType !== SwapType.Leverage) {
    return false;
  }
  // Only the flash-loan adapter path runs the on-chain check.
  if (!state.useFlashloan) return false;

  const buyTokenAddress = state.buyAmountToken?.underlyingAddress?.toLowerCase();
  // Nothing chosen yet: let the rest of the flow prompt for an asset first.
  if (!buyTokenAddress) return false;

  const enabled = collateralEnabledByAddress.get(buyTokenAddress);
  // A reserve the user has never supplied has no user config; supplying through this flow sets
  // it as collateral, so absence is not a block.
  if (enabled === undefined) return false;
  return !enabled;
};

export const BuyTokenCollateralBlockingGuard = ({
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
  const collateralEnabledByAddress = useCollateralEnabledByAddress();

  useEffect(() => {
    const isBlocking = hasBuyTokenNotUsedAsCollateral(state, collateralEnabledByAddress);
    const isAlreadyBlockingError =
      state.error?.rawError instanceof Error &&
      state.error.rawError.message === BLOCKING_ERROR_MESSAGE;

    if (isBlocking) {
      if (!isAlreadyBlockingError) {
        const blockingError: SwapError = {
          rawError: new Error(BLOCKING_ERROR_MESSAGE),
          message:
            'The asset you are swapping into is not enabled as collateral on your position. Enable it as collateral first, otherwise this order cannot settle.',
          actionBlocked: true,
        };
        setState({
          error: blockingError,
          actionsBlocked: { [ActionsBlockedReason.BUY_TOKEN_NOT_COLLATERAL]: true },
        });
      }
    } else if (isAlreadyBlockingError) {
      setState({
        error: undefined,
        actionsBlocked: { [ActionsBlockedReason.BUY_TOKEN_NOT_COLLATERAL]: undefined },
      });
    }
  }, [state, setState, collateralEnabledByAddress]);

  if (!isSwapFlowSelected) return null;
  if (!state.actionsBlocked?.[ActionsBlockedReason.BUY_TOKEN_NOT_COLLATERAL]) return null;
  return <BuyTokenCollateralBlockingError sx={sx} />;
};
