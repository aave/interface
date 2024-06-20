import {
  FormattedGhoReserveData,
  FormattedGhoUserData,
  FormatUserSummaryAndIncentivesResponse,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { getAddress } from 'ethers/lib/utils';
import memoize from 'micro-memoize';
import { TokenNativeYield } from 'src/services/TokenNativeYieldService';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { displayGho, weightedAverageAPY } from 'src/utils/ghoUtilities';

import { useGhoPoolsFormattedReserve } from './useGhoPoolFormattedReserve';
import {
  FormattedReservesAndIncentives,
  usePoolsFormattedReserves,
} from './usePoolFormattedReserves';
import { useTokensNativeYield } from './useTokenNativeYield';
import { useUserGhoPoolsFormattedReserve } from './useUserGhoPoolFormattedReserve';
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
    formattedGhoReserveData: FormattedGhoReserveData | undefined,
    formattedGhoUserData: FormattedGhoUserData | undefined,
    user: FormatUserSummaryAndIncentivesResponse,
    tokensNativeApy: TokenNativeYield,
    currentMarket: string
  ) => {
    console.log('---tokensNativeApy', tokensNativeApy);
    const proportions = user.userReservesData.reduce(
      (acc, value) => {
        const reserve = formattedPoolReserves.find(
          (r) => r.underlyingAsset === value.reserve.underlyingAsset
        );

        if (reserve) {
          // console.log('reserve', reserve);
          if (value.underlyingBalanceUSD !== '0') {
            acc.positiveProportion = acc.positiveProportion.plus(
              new BigNumber(reserve.supplyAPY).multipliedBy(value.underlyingBalanceUSD)
            );

            console.log('---reserve', reserve.supplyAPY);
            const nativeAPR = tokensNativeApy[getAddress(reserve.underlyingAsset)];
            console.log('---nativeAPR', nativeAPR);

            if (nativeAPR) {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(nativeAPR).multipliedBy(value.underlyingBalanceUSD)
              );
            }
            if (reserve.aIncentivesData) {
              reserve.aIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  new BigNumber(incentive.incentiveAPR).multipliedBy(value.underlyingBalanceUSD)
                );
              });
            }
          }
          if (value.variableBorrowsUSD !== '0') {
            // TODO: Export to unified helper function
            if (
              displayGho({ symbol: reserve.symbol, currentMarket: currentMarket }) &&
              formattedGhoUserData &&
              formattedGhoReserveData
            ) {
              const borrowRateAfterDiscount = weightedAverageAPY(
                formattedGhoReserveData.ghoVariableBorrowAPY,
                formattedGhoUserData.userGhoBorrowBalance,
                formattedGhoUserData.userGhoAvailableToBorrowAtDiscount,
                formattedGhoReserveData.ghoBorrowAPYWithMaxDiscount
              );
              acc.negativeProportion = acc.negativeProportion.plus(
                new BigNumber(borrowRateAfterDiscount).multipliedBy(
                  formattedGhoUserData.userGhoBorrowBalance
                )
              );
              if (reserve.vIncentivesData) {
                reserve.vIncentivesData.forEach((incentive) => {
                  acc.positiveProportion = acc.positiveProportion.plus(
                    new BigNumber(incentive.incentiveAPR).multipliedBy(
                      formattedGhoUserData.userGhoBorrowBalance
                    )
                  );
                });
              }
            } else {
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
            }
          }
          if (value.stableBorrowsUSD !== '0') {
            acc.negativeProportion = acc.negativeProportion.plus(
              new BigNumber(value.stableBorrowAPY).multipliedBy(value.stableBorrowsUSD)
            );
            if (reserve.sIncentivesData) {
              reserve.sIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  new BigNumber(incentive.incentiveAPR).multipliedBy(value.stableBorrowsUSD)
                );
              });
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
      tokensNativeAPY: tokensNativeApy,
    };
  }
);

export const useUserYields = (
  marketsData: MarketDataType[]
): SimplifiedUseQueryResult<UserYield>[] => {
  const poolsFormattedReservesQuery = usePoolsFormattedReserves(marketsData);
  const ghoPoolsFormattedReserveQuery = useGhoPoolsFormattedReserve(marketsData);
  const userGhoPoolsFormattedReserveQuery = useUserGhoPoolsFormattedReserve(marketsData);
  const userSummaryQuery = useUserSummariesAndIncentives(marketsData);
  const tokensNativeApy = useTokensNativeYield();

  return poolsFormattedReservesQuery.map((elem, index) => {
    const marketData = marketsData[index];
    const selector = (
      formattedPoolReserves: FormattedReservesAndIncentives[],
      formattedGhoReserveData: FormattedGhoReserveData,
      formattedGhoUserData: FormattedGhoUserData,
      user: FormatUserSummaryAndIncentivesResponse,
      tokensNativeApy: TokenNativeYield
    ) => {
      return formatUserYield(
        formattedPoolReserves,
        formattedGhoReserveData,
        formattedGhoUserData,
        user,
        tokensNativeApy,
        marketData.market
      );
    };
    const ghoSelector = (
      formattedPoolReserves: FormattedReservesAndIncentives[],
      user: FormatUserSummaryAndIncentivesResponse,
      tokensNativeApy: TokenNativeYield
    ) => {
      return formatUserYield(
        formattedPoolReserves,
        undefined,
        undefined,
        user,
        tokensNativeApy,
        marketData.market
      );
    };
    if (marketData.addresses.GHO_TOKEN_ADDRESS)
      return combineQueries(
        [
          elem,
          ghoPoolsFormattedReserveQuery[index],
          userGhoPoolsFormattedReserveQuery[index],
          userSummaryQuery[index],
          tokensNativeApy,
        ] as const,
        selector
      );
    return combineQueries([elem, userSummaryQuery[index], tokensNativeApy] as const, ghoSelector);
  });
};

export const useUserYield = (marketData: MarketDataType) => {
  return useUserYields([marketData])[0];
};
