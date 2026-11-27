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

// The leverage adapter reverts the order's post hook unless the bought asset is already collateral.
export const hasBuyTokenNotUsedAsCollateral = (
  state: SwapState,
  collateralEnabledByAddress: Map<string, boolean>
) => {
  if (state.swapType !== SwapType.Leverage) return false;

  const buyTokenAddress = state.buyAmountToken?.underlyingAddress?.toLowerCase();
  if (!buyTokenAddress) return false;

  const enabled = collateralEnabledByAddress.get(buyTokenAddress);
  // Without a user config the supply enables it, so only an explicit false blocks.
  return enabled === false;
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
            'The asset you are buying is not enabled as collateral on your position. Enable it as collateral first, otherwise this order cannot settle.',
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
