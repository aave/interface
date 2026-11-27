import { SxProps } from '@mui/material';
import React, { Dispatch, useEffect, useMemo } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';
import { useZeroLTVBlockingWithdraw } from 'src/hooks/useZeroLTVBlockingWithdraw';

import { ActionsBlockedReason, SwapError, SwapState, SwapType } from '../../types';
import { ZeroLTVBlockingError } from './ZeroLTVBlockingError';

// The cow-swap-adapter withdraws `_sellToken` (see
// cow-swap-adapters/src/adapters/v3/*Adapter.sol): the collateral picked as
// "Using" on repay with collateral, the source collateral otherwise. Read it from
// the selected token, which changes in the same update that resets errors, and
// match by address since the token symbol can be the native one (ETH for WETH).
const getWithdrawnAsset = (state: SwapState) =>
  (state.swapType === SwapType.RepayWithCollateral
    ? state.destinationToken
    : state.sourceToken
  ).underlyingAddress.toLowerCase();

// Mirrors `validateHFAndLtvzero` in aave-v3-origin SupplyLogic: when the user
// has any zero-LTV collateral enabled, every withdrawn aToken must itself have
// zero LTV. The check only runs when the withdrawn aToken is enabled as
// collateral for the user (executeWithdraw / finalizeTransfer skip it otherwise).
export const hasZeroLTVBlocking = (
  state: SwapState,
  blockingReserves: FormattedUserReserves[],
  userReserves: { underlyingAsset: string; usageAsCollateralEnabledOnUser: boolean }[]
) => {
  if (blockingReserves.length === 0) return false;
  // Direct DEX swaps don't touch Aave; the on-chain check never runs.
  if (state.swapType === SwapType.Swap) return false;
  // DebtSwap repays old debt and opens new debt. Neither path withdraws an
  // aToken from the user, so validateHFAndLtvzero never fires.
  if (state.swapType === SwapType.DebtSwap) return false;
  // Leverage supplies the bought collateral and draws new debt; nothing is withdrawn either.
  if (state.swapType === SwapType.Leverage) return false;

  const withdrawnAsset = getWithdrawnAsset(state);
  const withdrawnUserReserve = userReserves.find(
    (userReserve) => userReserve.underlyingAsset.toLowerCase() === withdrawnAsset
  );
  if (withdrawnUserReserve && !withdrawnUserReserve.usageAsCollateralEnabledOnUser) return false;
  // Withdrawing the LTV=0 asset itself is allowed by the protocol.
  return !blockingReserves.some(
    (userReserve) => userReserve.underlyingAsset.toLowerCase() === withdrawnAsset
  );
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
  const { user } = useAppDataContext();
  const userReserves = useMemo(() => user?.userReservesData ?? [], [user?.userReservesData]);
  const withdrawnAsset = getWithdrawnAsset(state);

  useEffect(() => {
    const isBlocking = hasZeroLTVBlocking(state, assetsBlockingWithdraw, userReserves);

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
  }, [assetsBlockingWithdraw, userReserves, withdrawnAsset, state.swapType]);

  if (hasZeroLTVBlocking(state, assetsBlockingWithdraw, userReserves)) {
    return <ZeroLTVBlockingError sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }} />;
  }

  return null;
};
