import { FormatUserSummaryAndIncentivesResponse } from '@aave/math-utils';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';
import { reserveSortFn } from 'src/store/poolSelectors';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { FormattedReservesAndIncentives } from './usePoolFormattedReserves';
import { useUserPoolsReservesHumanized } from './useUserPoolReserves';
import {
  UserSummaryAndIncentives,
  useUserSummariesAndIncentives,
} from './useUserSummaryAndIncentives';
import { UserYield, useUserYields } from './useUserYield';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

export type ExtendedFormattedUser =
  FormatUserSummaryAndIncentivesResponse<FormattedReservesAndIncentives> & {
    earnedAPY: number;
    debtAPY: number;
    netAPY: number;
    isInEmode: boolean;
    userEmodeCategoryId: number;
  };

const formatExtendedUserAndIncentives = (
  userSummariesAndIncentives: UserSummaryAndIncentives,
  userYield: UserYield,
  userReserves: UserReservesDataHumanized
) => {
  return {
    ...userSummariesAndIncentives,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
    isInEmode: userReserves.userEmodeCategoryId !== 0,
    userReservesData: userSummariesAndIncentives.userReservesData.sort((a, b) =>
      reserveSortFn(a.reserve, b.reserve)
    ),
    earnedAPY: userYield.earnedAPY,
    debtAPY: userYield.debtAPY,
    netAPY: userYield.netAPY,
  };
};

export const useExtendedUserSummariesAndIncentives = (
  marketsData: MarketDataType[]
): SimplifiedUseQueryResult<ExtendedFormattedUser>[] => {
  const userSummariesQueries = useUserSummariesAndIncentives(marketsData);
  const userYieldsQueries = useUserYields(marketsData);
  const userReservesQueries = useUserPoolsReservesHumanized(marketsData);

  return userSummariesQueries.map((elem, index) => {
    return combineQueries(
      [elem, userYieldsQueries[index], userReservesQueries[index]] as const,
      formatExtendedUserAndIncentives
    );
  });
};

export const useExtendedUserSummaryAndIncentives = (marketData: MarketDataType) => {
  return useExtendedUserSummariesAndIncentives([marketData])[0];
};
