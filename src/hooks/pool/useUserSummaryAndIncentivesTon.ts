import { useEffect, useState } from 'react';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { generateRawUserSummaryTon } from 'src/utils/generate-raw-user-summary-tom';

import { FormattedUserReserves } from './useUserSummaryAndIncentives';

export const useUserSummaryAndIncentivesTon = (yourSuppliesTon: FormattedUserReserves[]) => {
  const [userSummaryTon, setUserSummaryTon] = useState<ExtendedFormattedUser>();

  const userEmodeCategoryId = 0;

  useEffect(() => {
    const {
      availableBorrowsMarketReferenceCurrency,
      totalCollateralMarketReferenceCurrency,
      totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold,
      collateralInUSDAsset,
      availableBorrowsUSD,
      totalCollateralUSD,
      currentLoanToValue,
      totalLiquidityUSD,
      totalBorrowsUSD,
      healthFactor,
      netWorthUSD,
      earnedAPY,
      debtAPY,
      netAPY,
      isolatedReserve,
    } = generateRawUserSummaryTon({
      userReserves: yourSuppliesTon,
      userEmodeCategoryId: userEmodeCategoryId,
    });

    const res = {
      collateralInUSDAsset: collateralInUSDAsset.toString(),
      userReservesData: yourSuppliesTon,
      totalLiquidityMarketReferenceCurrency: totalLiquidityUSD.toString(), /// totalLiquidityUSD = totalLiquidityMarketReferenceCurrency
      totalLiquidityUSD: totalLiquidityUSD.toString(), /// totalLiquidityUSD = totalLiquidityMarketReferenceCurrency
      totalCollateralMarketReferenceCurrency: totalCollateralMarketReferenceCurrency.toString(),
      totalCollateralUSD: totalCollateralUSD.toString(),
      totalBorrowsMarketReferenceCurrency: totalBorrowsMarketReferenceCurrency.toString(),
      totalBorrowsUSD: totalBorrowsUSD.toString(),
      netWorthUSD: netWorthUSD.toString(),
      availableBorrowsMarketReferenceCurrency: availableBorrowsMarketReferenceCurrency.toString(), /// availableBorrowsUSD = availableBorrowsMarketReferenceCurrency
      availableBorrowsUSD: availableBorrowsUSD.toString(), /// availableBorrowsUSD = availableBorrowsMarketReferenceCurrency
      currentLoanToValue: currentLoanToValue.toString(),
      currentLiquidationThreshold: currentLiquidationThreshold.toString(),
      healthFactor: healthFactor.toString(),
      isInIsolationMode: false,
      calculatedUserIncentives: {},
      userEmodeCategoryId: userEmodeCategoryId,
      isInEmode: false,
      earnedAPY: earnedAPY,
      debtAPY: debtAPY,
      netAPY: netAPY ? netAPY : 0,
      isolatedReserve,
    };
    console.log('User Summary Ton----------', res);
    setUserSummaryTon(res as ExtendedFormattedUser);
  }, [yourSuppliesTon]);

  return {
    userSummaryTon,
  };
};