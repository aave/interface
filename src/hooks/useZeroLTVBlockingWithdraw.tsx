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

  const zeroLTVBlockingWithdraw: string[] = [];
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
      zeroLTVBlockingWithdraw.push(userReserve.reserve.symbol);
    }
  });

  return zeroLTVBlockingWithdraw;
};
