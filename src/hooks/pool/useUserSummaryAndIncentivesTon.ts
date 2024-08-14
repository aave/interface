import { useEffect, useState } from 'react';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { generateRawUserSummaryTon } from 'src/utils/generate-raw-user-summary-tom';

import { FormattedUserReserves } from './useUserSummaryAndIncentives';

export const useUserSummaryAndIncentivesTon = (yourSuppliesTon: FormattedUserReserves[]) => {
  const [userSummaryTon, setUserSummaryTon] = useState<ExtendedFormattedUser>();

  useEffect(() => {
    const {
      collateralInUSDAsset,
      totalLiquidityUSD,
      totalCollateralUSD,
      totalBorrowsUSD,
      healthFactor,
      netWorthUSD,
      earnedAPY,
      netAPY,
    } = generateRawUserSummaryTon({ userReserves: yourSuppliesTon });

    const res = {
      collateralInUSDAsset: collateralInUSDAsset.toString(),
      userReservesData: yourSuppliesTon,
      totalLiquidityMarketReferenceCurrency: '111',
      totalLiquidityUSD: totalLiquidityUSD.toString() || '0',
      totalCollateralMarketReferenceCurrency: '113',
      totalCollateralUSD: totalCollateralUSD.toString(),
      totalBorrowsMarketReferenceCurrency: '115',
      totalBorrowsUSD: totalBorrowsUSD.toString(),
      netWorthUSD: netWorthUSD.toString(),
      availableBorrowsMarketReferenceCurrency: '118',
      availableBorrowsUSD: '119',
      currentLoanToValue: '120',
      currentLiquidationThreshold: '121',
      healthFactor: healthFactor.toString(),
      isInIsolationMode: false,
      calculatedUserIncentives: {},
      userEmodeCategoryId: 0,
      isInEmode: false,
      earnedAPY: earnedAPY,
      debtAPY: 1,
      netAPY: netAPY ? netAPY : 0,
    };
    setUserSummaryTon(res as ExtendedFormattedUser);
  }, [yourSuppliesTon]);

  return {
    userSummaryTon,
  };
};
