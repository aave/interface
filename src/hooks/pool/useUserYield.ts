import { FormatUserSummaryAndIncentivesResponse } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import memoize from 'micro-memoize';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import {
  emptyMeritMap,
  MeritAprByUnderlying,
  usePoolsMerits,
} from './usePoolsMerits';
import {
  FormattedReservesAndIncentives,
  usePoolsFormattedReserves,
} from './usePoolFormattedReserves';
import { useUserSummariesAndIncentives } from './useUserSummaryAndIncentives';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

export interface UserYield {
  earnedAPY: number;
  debtAPY: number;
  netAPY: number;
}

const formatUserYield = memoize(
  (
    formattedPoolReserves: FormattedReservesAndIncentives[],
    user: FormatUserSummaryAndIncentivesResponse,
    meritByUnderlying: MeritAprByUnderlying,
  ) => {
    const proportions = user.userReservesData.reduce(
      (acc, value) => {
        const reserve = formattedPoolReserves.find(
          (r) => r.underlyingAsset === value.reserve.underlyingAsset
        );

        if (reserve) {
          const meritEntry = meritByUnderlying.get(
            reserve.underlyingAsset.toLowerCase()
          );
          if (value.underlyingBalanceUSD !== '0') {
            acc.positiveProportion = acc.positiveProportion.plus(
              new BigNumber(reserve.supplyAPY).multipliedBy(value.underlyingBalanceUSD)
            );
            if (reserve.aIncentivesData) {
              reserve.aIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  new BigNumber(incentive.incentiveAPR).multipliedBy(value.underlyingBalanceUSD)
                );
              });
            }
            // Merit supply-side APR — backend already filtered by user
            // eligibility (only credits when the user passes the criteria
            // rules for the program).
            if (meritEntry && meritEntry.supplyApr > 0) {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(meritEntry.supplyApr / 100).multipliedBy(
                  value.underlyingBalanceUSD
                )
              );
            }
          }
          if (value.variableBorrowsUSD !== '0') {
            acc.negativeProportion = acc.negativeProportion.plus(
              new BigNumber(reserve.variableBorrowAPY).multipliedBy(value.variableBorrowsUSD)
            );
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  new BigNumber(incentive.incentiveAPR).multipliedBy(value.variableBorrowsUSD)
                );
              });
            }
            // Merit borrow-side APR (negative on the debt cost, hence
            // added to the positive proportion to offset borrow interest).
            if (meritEntry && meritEntry.borrowApr > 0) {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(meritEntry.borrowApr / 100).multipliedBy(
                  value.variableBorrowsUSD
                )
              );
            }
          }
        } else {
          throw new Error('no possible to calculate net apy');
        }

        return acc;
      },
      {
        positiveProportion: new BigNumber(0),
        negativeProportion: new BigNumber(0),
      }
    );

    const earnedAPY = proportions.positiveProportion.dividedBy(user.totalLiquidityUSD).toNumber();
    const debtAPY = proportions.negativeProportion.dividedBy(user.totalBorrowsUSD).toNumber();
    const netAPY =
      (earnedAPY || 0) *
        (Number(user.totalLiquidityUSD) /
          Number(user.netWorthUSD !== '0' ? user.netWorthUSD : '1')) -
      (debtAPY || 0) *
        (Number(user.totalBorrowsUSD) / Number(user.netWorthUSD !== '0' ? user.netWorthUSD : '1'));
    return {
      earnedAPY,
      debtAPY,
      netAPY,
    };
  }
);

export const useUserYields = (
  marketsData: MarketDataType[],
  userAddress?: string
): SimplifiedUseQueryResult<UserYield>[] => {
  const poolsFormattedReservesQuery = usePoolsFormattedReserves(marketsData);
  const userSummaryQuery = useUserSummariesAndIncentives(marketsData);
  const poolsMeritsQueries = usePoolsMerits(marketsData, userAddress);

  return poolsFormattedReservesQuery.map((elem, index) => {
    const meritMap = poolsMeritsQueries[index]?.data ?? emptyMeritMap();
    const selector = (
      formattedPoolReserves: FormattedReservesAndIncentives[],
      user: FormatUserSummaryAndIncentivesResponse
    ) => {
      return formatUserYield(formattedPoolReserves, user, meritMap);
    };

    return combineQueries([elem, userSummaryQuery[index]] as const, selector);
  });
};

export const useUserYield = (marketData: MarketDataType, userAddress?: string) => {
  return useUserYields([marketData], userAddress)[0];
};
