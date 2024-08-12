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
            return {
              ...asset,
              underlyingBalanceUSD: String(
                (Number(match?.value) || 0) * (Number(asset.underlyingBalance) || 0)
              ),
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
      totalLiquidityUSD,
      totalCollateralUSD,
      totalBorrowsUSD,
      netWorthUSD,
      earnedAPY,
      netAPY,
    } = generateRawUserSummaryTon({ userReserves: userReservesDataUpdate });

    const res = {
      userReservesData: userReservesDataUpdate,
      totalLiquidityMarketReferenceCurrency: '111',
      totalLiquidityUSD: String(totalLiquidityUSD) || '0',
      totalCollateralMarketReferenceCurrency: '113',
      totalCollateralUSD: String(totalCollateralUSD),
      totalBorrowsMarketReferenceCurrency: '115',
      totalBorrowsUSD: String(totalBorrowsUSD),
      netWorthUSD: String(netWorthUSD),
      availableBorrowsMarketReferenceCurrency: '118',
      availableBorrowsUSD: '119',
      currentLoanToValue: '120',
      currentLiquidationThreshold: '121',
      healthFactor: '122',
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
