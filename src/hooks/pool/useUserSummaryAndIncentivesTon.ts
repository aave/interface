import { LTV_PRECISION, normalize } from '@aave/math-utils';
import { useEffect, useState } from 'react';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { generateRawUserSummaryTon } from 'src/utils/generate-raw-user-summary-tom';

import { FormattedUserReserves } from './useUserSummaryAndIncentives';

export const useUserSummaryAndIncentivesTon = (
  yourSuppliesTon: FormattedUserReserves[],
  contractUserTon: string
) => {
  const [userSummaryTon, setUserSummaryTon] = useState<ExtendedFormattedUser>();
  const [loading, setLoading] = useState<boolean>(true);
  const { isConnectedTonWallet } = useTonConnectContext();

  const userEmodeCategoryId = 0;

  useEffect(() => {
    if (!yourSuppliesTon) {
      setLoading(true);
      return;
    }

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
      totalLiquidityMarketReferenceCurrency: totalLiquidityUSD.toString(),
      totalLiquidityUSD: totalLiquidityUSD.toString(),
      totalCollateralMarketReferenceCurrency: totalCollateralMarketReferenceCurrency.toString(),
      totalCollateralUSD: totalCollateralUSD.toString(),
      totalBorrowsMarketReferenceCurrency: totalBorrowsMarketReferenceCurrency.toString(),
      totalBorrowsUSD: totalBorrowsUSD.toString(),
      netWorthUSD: netWorthUSD.toString(),
      availableBorrowsMarketReferenceCurrency: availableBorrowsMarketReferenceCurrency.toString(),
      availableBorrowsUSD: availableBorrowsUSD.toString(),
      currentLoanToValue: normalize(currentLoanToValue, LTV_PRECISION),
      currentLiquidationThreshold: normalize(currentLiquidationThreshold, LTV_PRECISION),
      healthFactor: healthFactor.toString(),
      isInIsolationMode: false,
      calculatedUserIncentives: {},
      userEmodeCategoryId: userEmodeCategoryId,
      isInEmode: false,
      earnedAPY: earnedAPY,
      debtAPY: debtAPY,
      netAPY: netAPY ? netAPY : 0,
      isolatedReserve,
      contractUserTon,
    };

    setUserSummaryTon(res);
    setLoading(false);
  }, [yourSuppliesTon, contractUserTon]);

  // useEffect(() => {
  //   console.log('User Summary Ton----------', userSummaryTon);
  //   console.log('Total-supply--------------', userSummaryTon?.collateralInUSDAsset);
  //   console.log('Total-borrow--------------', userSummaryTon?.totalBorrowsMarketReferenceCurrency);
  // }, [userSummaryTon]);

  useEffect(() => {
    if (!isConnectedTonWallet) {
      setUserSummaryTon(undefined);
    }
  }, [isConnectedTonWallet]);

  return {
    userSummaryTon,
    loading,
  };
};
