import { ProtocolAction } from '@aave/contract-helpers';
import { FormatUserSummaryAndIncentivesResponse } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import memoize from 'micro-memoize';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { getMeritData } from '../useMeritIncentives';
import { useUserMeritIncentives } from '../useUserMeritIncentives';
import {
  FormattedReservesAndIncentives,
  usePoolsFormattedReserves,
} from './usePoolFormattedReserves';
import { useUserSummariesAndIncentives } from './useUserSummaryAndIncentives';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

type UserMeritIncentivesData = {
  currentAPR: {
    actionsAPY: Record<string, number>;
  };
} | null;

export interface UserYield {
  earnedAPY: number;
  debtAPY: number;
  netAPY: number;
}

const formatUserYield = memoize(
  (
    formattedPoolReserves: FormattedReservesAndIncentives[],
    user: FormatUserSummaryAndIncentivesResponse,
    userMeritIncentives?: UserMeritIncentivesData,
    marketTitle?: string
  ) => {
    const proportions = user.userReservesData.reduce(
      (acc, value) => {
        const reserve = formattedPoolReserves.find(
          (r) => r.underlyingAsset === value.reserve.underlyingAsset
        );

        if (reserve) {
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

            // Add merit incentives for supply positions
            if (userMeritIncentives?.currentAPR?.actionsAPY) {
              const meritData = getMeritData(marketTitle || '', reserve.symbol);
              if (meritData) {
                meritData.forEach((merit) => {
                  if (merit.protocolAction === ProtocolAction.supply) {
                    const meritAPY = userMeritIncentives.currentAPR.actionsAPY[merit.action];
                    if (meritAPY) {
                      acc.positiveProportion = acc.positiveProportion.plus(
                        new BigNumber(meritAPY / 100).multipliedBy(value.underlyingBalanceUSD)
                      );
                    }
                  }
                });
              }
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

            // Add merit incentives for borrow positions (reduces borrowing cost)
            if (userMeritIncentives?.currentAPR?.actionsAPY) {
              const meritData = getMeritData(marketTitle || '', reserve.symbol);
              if (meritData) {
                meritData.forEach((merit) => {
                  if (merit.protocolAction === ProtocolAction.borrow) {
                    const meritAPY = userMeritIncentives.currentAPR.actionsAPY[merit.action];
                    if (meritAPY) {
                      // For borrow positions, merit incentives reduce the effective borrow cost
                      acc.positiveProportion = acc.positiveProportion.plus(
                        new BigNumber(meritAPY / 100).multipliedBy(value.variableBorrowsUSD)
                      );
                    }
                  }
                });
              }
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
  const userMeritIncentivesQuery = useUserMeritIncentives(userAddress);

  return poolsFormattedReservesQuery.map((elem, index) => {
    const selector = (
      formattedPoolReserves: FormattedReservesAndIncentives[],
      user: FormatUserSummaryAndIncentivesResponse
    ) => {
      // Get merit incentives data separately
      const meritIncentives = userMeritIncentivesQuery.data;
      return formatUserYield(
        formattedPoolReserves,
        user,
        meritIncentives,
        marketsData[index].market
      );
    };

    return combineQueries([elem, userSummaryQuery[index]] as const, selector);
  });
};

export const useUserYield = (marketData: MarketDataType, userAddress?: string) => {
  return useUserYields([marketData], userAddress)[0];
};
