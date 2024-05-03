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

import {
  selectBaseCurrencyData,
  selectUserEModeCategory,
  selectUserReservesData,
} from './selectors';
import {
  FormattedReservesAndIncentives,
  usePoolsFormattedReserves,
  UsePoolsFormattedReservesMarketDataType,
} from './usePoolFormattedReserves';
import {
  usePoolsReservesHumanized,
  UsePoolsReservesHumanizedMarketDataType,
} from './usePoolReserves';
import {
  usePoolsReservesIncentivesHumanized,
  UsePoolsReservesIncentivesHumanizedMarketDataType,
} from './usePoolReservesIncentives';
import {
  UseUserPoolsPoolReservesHumanizedMarketDataType,
  useUserPoolsReservesHumanized,
} from './useUserPoolReserves';
import {
  useUserPoolsReservesIncentivesHumanized,
  UseUserPoolsReservesIncentivesHumanizedMarketDataType,
} from './useUserPoolReservesIncentives';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

export type UseUserSummariesAndIncentivesMarketDataType = UsePoolsReservesHumanizedMarketDataType &
  UseUserPoolsPoolReservesHumanizedMarketDataType &
  UsePoolsFormattedReservesMarketDataType &
  UsePoolsReservesIncentivesHumanizedMarketDataType &
  UseUserPoolsReservesIncentivesHumanizedMarketDataType;

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
  marketsData: UseUserSummariesAndIncentivesMarketDataType[]
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

export const useUserSummaryAndIncentives = (
  marketData: UseUserSummariesAndIncentivesMarketDataType
) => {
  return useUserSummariesAndIncentives([marketData])[0];
};
