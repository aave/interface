import { SxProps } from '@mui/material';
import React, { Dispatch, useEffect } from 'react';
import { useZeroLTVBlockingWithdraw } from 'src/hooks/useZeroLTVBlockingWithdraw';

import { ActionsBlockedReason, SwapError, SwapState, SwapType } from '../../types';
import { ZeroLTVBlockingError } from './ZeroLTVBlockingError';

export const hasZeroLTVBlocking = (state: SwapState, blockingAssets: string[]) => {
  // DebtSwap (repay old debt + borrow new debt) never triggers validateHFAndLtv
  // because neither repay nor borrow calls that validation.
  if (state.swapType === SwapType.DebtSwap) {
    return false;
  }
  // CollateralSwap does supply + withdraw. The withdraw triggers validateHFAndLtv
  // which scans ALL collaterals. Block if any zero-LTV collateral exists.
  if (state.swapType === SwapType.CollateralSwap) {
    return blockingAssets.length > 0;
  }
  // RepayWithCollateral does repay + withdraw. The withdraw triggers
  // validateHFAndLtv. Block if there are zero-LTV collateral assets that are
  // NOT the source token being withdrawn. The pool allows withdrawing a
  // zero-LTV asset itself (getLtv() == 0 passes the check).
  return blockingAssets.length > 0 && !blockingAssets.includes(state.sourceToken.symbol);
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
  }, [assetsBlockingWithdraw, state.sourceToken.symbol, state.swapType]);

  if (hasZeroLTVBlocking(state, assetsBlockingWithdraw)) {
    return <ZeroLTVBlockingError sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />;
  }

  return null;
};
