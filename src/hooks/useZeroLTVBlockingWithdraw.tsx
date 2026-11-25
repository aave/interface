import { EmodeCategory } from 'src/helpers/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { hasNonZeroEffectiveLtv } from 'src/utils/hfUtils';

import { useExtendedUserSummaryAndIncentives } from './pool/useExtendedUserSummaryAndIncentives';

type ZeroLTVUserSummary = {
  totalBorrowsUSD: string;
  isInEmode: boolean;
  userEmodeCategoryId: number;
  userReservesData: {
    scaledATokenBalance: string;
    usageAsCollateralEnabledOnUser: boolean;
    reserve: {
      baseLTVasCollateral: string;
      reserveLiquidationThreshold: string;
      eModes: { id: number; collateralEnabled: boolean; ltvzeroEnabled: boolean }[];
    };
  }[];
};

/**
 * Zero-LTV collateral that makes `validateHFAndLtvzero` (aave-v3-origin) reject removing any
 * other collateral.
 *
 * When the check runs depends on the action:
 * - withdraw (executeWithdraw) and aToken transfer (executeFinalizeTransfer, CoW swaps) only run
 *   it when the user is borrowing, so without debt nothing blocks;
 * - disabling collateral (executeUseReserveAsCollateral) always runs it, debt or not. Pass
 *   `ignoreDebt` for that action.
 */
export const getZeroLTVBlockingReserves = <T extends ZeroLTVUserSummary>(
  userSummary: T,
  eModes: Record<number, EmodeCategory>,
  { ignoreDebt = false }: { ignoreDebt?: boolean } = {}
): T['userReservesData'] => {
  if (!ignoreDebt && userSummary.totalBorrowsUSD === '0') {
    return [];
  }

  return userSummary.userReservesData.filter((userReserve) => {
    const emodeCategory = userReserve.reserve.eModes.find(
      (e) => e.id === userSummary.userEmodeCategoryId
    );
    const hasEffectiveLtv = hasNonZeroEffectiveLtv({
      baseLTVasCollateral: userReserve.reserve.baseLTVasCollateral,
      isInEmode: userSummary.isInEmode,
      emodeEntry: emodeCategory,
      isEModeIsolated: !!eModes[userSummary.userEmodeCategoryId]?.isolated,
    });

    return (
      !hasEffectiveLtv &&
      Number(userReserve.scaledATokenBalance) > 0 &&
      userReserve.usageAsCollateralEnabledOnUser &&
      userReserve.reserve.reserveLiquidationThreshold !== '0'
    );
  });
};

export const useZeroLTVBlockingWithdraw = (options?: { ignoreDebt?: boolean }) => {
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const { data: userSummary } = useExtendedUserSummaryAndIncentives(currentMarketData);
  const { eModes } = useAppDataContext();

  if (!currentMarketData.v3 || !userSummary) {
    return [];
  }

  return getZeroLTVBlockingReserves(userSummary, eModes, options);
};

// Mirrors `validateHFAndLtvzero` in aave-v3-origin: while zero-LTV collateral is
// enabled, removing collateral is only allowed for a zero-LTV asset. Withdrawing a
// supply that is not enabled as collateral, or enabling one, never runs the check.
export const isBlockedByZeroLTV = (
  blockingReserves: { underlyingAsset: string }[],
  userReserve: { underlyingAsset: string; usageAsCollateralEnabledOnUser: boolean }
) =>
  userReserve.usageAsCollateralEnabledOnUser &&
  blockingReserves.length > 0 &&
  !blockingReserves.some(
    (r) => r.underlyingAsset.toLowerCase() === userReserve.underlyingAsset.toLowerCase()
  );
