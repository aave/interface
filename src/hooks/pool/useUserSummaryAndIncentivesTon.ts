import { formatUnits } from 'ethers/lib/utils';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { generateRawUserSummaryTon } from 'src/utils/generate-raw-user-summary-tom';

import { WalletBalanceUSD } from '../app-data-provider/useSocketGetRateUSD';
import { FormattedUserReserves } from './useUserSummaryAndIncentives';

export const useUserSummaryAndIncentivesTon = (
  ExchangeRateListUSD: WalletBalanceUSD[],
  yourSuppliesTon: FormattedUserReserves[]
) => {
  const [userSummaryTon, setUserSummaryTon] = useState<ExtendedFormattedUser>();

  const updateRealTimeBalanceUSD = useCallback(
    (data: FormattedUserReserves[]) => {
      try {
        if (!data || !ExchangeRateListUSD) return [];

        const result = _.map(data, (asset: FormattedUserReserves) => {
          const match = _.find(ExchangeRateListUSD, { address: asset?.underlyingAssetTon });
          if (match) {
            const numberFormateUSD = Number(match.usd).toFixed(0).toString();
            const usdRate = Number(formatUnits(numberFormateUSD, match.decimal));
            const underlyingBalanceUSD = String(usdRate * Number(asset.underlyingBalance));
            const variableBorrowsUSD = String(usdRate * Number(asset.variableBorrows));
            return {
              ...asset,
              underlyingBalanceUSD: underlyingBalanceUSD,
              variableBorrowsUSD: variableBorrowsUSD,
            };
          }
          return asset;
        });

        return result;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    [ExchangeRateListUSD]
  );

  useEffect(() => {
    const userReservesDataUpdate = updateRealTimeBalanceUSD(yourSuppliesTon); // matching data
    const {
      collateralInUSDAsset,
      totalLiquidityUSD,
      totalCollateralUSD,
      totalBorrowsUSD,
      healthFactor,
      netWorthUSD,
      earnedAPY,
      netAPY,
    } = generateRawUserSummaryTon({ userReserves: userReservesDataUpdate });

    const res = {
      collateralInUSDAsset: collateralInUSDAsset.toString(),
      userReservesData: userReservesDataUpdate,
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
  }, [yourSuppliesTon, ExchangeRateListUSD, updateRealTimeBalanceUSD]);

  return {
    userSummaryTon,
  };
};
