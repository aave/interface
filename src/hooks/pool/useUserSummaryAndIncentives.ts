import {
  ReservesDataHumanized,
  ReservesIncentiveDataHumanized,
  UserReservesIncentivesDataHumanized,
} from '@aave/contract-helpers';
import {
  ComputedUserReserve,
  formatUserSummaryAndIncentives as _formatUserSummaryAndIncentives,
  FormatUserSummaryAndIncentivesResponse,
} from '@aave/math-utils';
import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import {
  selectBaseCurrencyData,
  selectUserEModeCategory,
  selectUserReservesData,
} from './selectors';
import {
  FormattedReservesAndIncentives,
  usePoolsFormattedReserves,
} from './usePoolFormattedReserves';
import { usePoolsReservesHumanized } from './usePoolReserves';
import { usePoolsReservesIncentivesHumanized } from './usePoolReservesIncentives';
import { useUserPoolsReservesHumanized } from './useUserPoolReserves';
import { useUserPoolsReservesIncentivesHumanized } from './useUserPoolReservesIncentives';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

export type FormattedUserReserves = ComputedUserReserve<FormattedReservesAndIncentives>;

export type UserSummaryAndIncentives =
  FormatUserSummaryAndIncentivesResponse<FormattedReservesAndIncentives> & {
    userReservesData: FormattedUserReserves[];
  };

const formatUserSummaryAndIncentivesss = memoize(
  (
    poolReserves: ReservesDataHumanized,
    userPoolReserves: UserReservesDataHumanized,
    formattedPoolReserves: FormattedReservesAndIncentives[],
    reserveIncentiveData: ReservesIncentiveDataHumanized[],
    userIncentiveData: UserReservesIncentivesDataHumanized[]
  ) => {
    const baseCurrencyData = selectBaseCurrencyData(poolReserves);
    const userReserves = selectUserReservesData(userPoolReserves);
    const userEmodeCategoryId = selectUserEModeCategory(userPoolReserves);
    return _formatUserSummaryAndIncentives({
      currentTimestamp: dayjs().unix(),
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves,
      formattedReserves: formattedPoolReserves,
      userEmodeCategoryId: userEmodeCategoryId,
      reserveIncentives: reserveIncentiveData || [],
      userIncentives: userIncentiveData || [],
    });
  }
);

export const useUserSummariesAndIncentives = (
  marketsData: MarketDataType[]
): SimplifiedUseQueryResult<UserSummaryAndIncentives>[] => {
  const poolsReservesQuery = usePoolsReservesHumanized(marketsData);
  const userPoolsReservesQuery = useUserPoolsReservesHumanized(marketsData);
  const formattedReserves = usePoolsFormattedReserves(marketsData);
  const poolsReservesIncentivesQuery = usePoolsReservesIncentivesHumanized(marketsData);
  const userPoolsReservesIncentiveQuery = useUserPoolsReservesIncentivesHumanized(marketsData);

  return poolsReservesQuery.map((elem, index) => {
    return combineQueries(
      [
        elem,
        userPoolsReservesQuery[index],
        formattedReserves[index],
        poolsReservesIncentivesQuery[index],
        userPoolsReservesIncentiveQuery[index],
      ] as const,
      formatUserSummaryAndIncentivesss
    );
  });
};

export const useUserSummaryAndIncentives = (marketData: MarketDataType) => {
  return useUserSummariesAndIncentives([marketData])[0];
};
