import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { hasNonZeroEffectiveLtv } from 'src/utils/hfUtils';

import { useExtendedUserSummaryAndIncentives } from './pool/useExtendedUserSummaryAndIncentives';

export const useZeroLTVBlockingWithdraw = () => {
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const { data: userSummary } = useExtendedUserSummaryAndIncentives(currentMarketData);
  const { eModes } = useAppDataContext();

  if (!currentMarketData.v3 || !userSummary) {
    return [];
  }

  if (userSummary.totalBorrowsUSD === '0') {
    return [];
  }

  const zeroLTVBlockingWithdraw: typeof userSummary.userReservesData = [];
  userSummary.userReservesData.forEach((userReserve) => {
    const emodeCategory = userReserve.reserve.eModes.find(
      (e) => e.id === userSummary.userEmodeCategoryId
    );
    const hasEffectiveLtv = hasNonZeroEffectiveLtv({
      baseLTVasCollateral: userReserve.reserve.baseLTVasCollateral,
      isInEmode: userSummary.isInEmode,
      emodeEntry: emodeCategory,
      isEModeIsolated: !!eModes[userSummary.userEmodeCategoryId]?.isolated,
    });

    if (
      !hasEffectiveLtv &&
      Number(userReserve.scaledATokenBalance) > 0 &&
      userReserve.usageAsCollateralEnabledOnUser &&
      userReserve.reserve.reserveLiquidationThreshold !== '0'
    ) {
      zeroLTVBlockingWithdraw.push(userReserve);
    }
  });

  return zeroLTVBlockingWithdraw;
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
