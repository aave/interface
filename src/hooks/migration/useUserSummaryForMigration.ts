import { ReservesDataHumanized, ReservesIncentiveDataHumanized } from '@aave/contract-helpers';
import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';
import { selectFormatUserSummaryForMigration } from 'src/store/v3MigrationSelectors';

import {
  usePoolReservesHumanized,
  UsePoolsReservesHumanizedMarketDataType,
} from '../pool/usePoolReserves';
import {
  usePoolReservesIncentivesHumanized,
  UsePoolsReservesIncentivesHumanizedMarketDataType,
} from '../pool/usePoolReservesIncentives';
import {
  useUserPoolReservesHumanized,
  UseUserPoolsPoolReservesHumanizedMarketDataType,
} from '../pool/useUserPoolReserves';
import { combineQueries } from '../pool/utils';

export type UserSummaryForMigration = NonNullable<
  ReturnType<typeof useUserSummaryForMigration>['data']
>;

const selector = memoize(
  (
    toReservesData: ReservesDataHumanized,
    toUserReservesData: UserReservesDataHumanized,
    toReservesIncentivesData: ReservesIncentiveDataHumanized[]
  ) => {
    return selectFormatUserSummaryForMigration(
      toReservesData.reservesData,
      toReservesIncentivesData,
      toUserReservesData.userReserves,
      toReservesData.baseCurrencyData,
      dayjs().unix(),
      toUserReservesData.userEmodeCategoryId
    );
  }
);

export type UseUserSummaryForMigrationMarketDataType = UsePoolsReservesHumanizedMarketDataType &
  UseUserPoolsPoolReservesHumanizedMarketDataType &
  UsePoolsReservesIncentivesHumanizedMarketDataType;

export const useUserSummaryForMigration = (
  marketData: UseUserSummaryForMigrationMarketDataType
) => {
  const toReservesDataQuery = usePoolReservesHumanized(marketData);
  const toUserReservesDataQuery = useUserPoolReservesHumanized(marketData);
  const toReservesIncentivesDataQuery = usePoolReservesIncentivesHumanized(marketData);

  return combineQueries(
    [toReservesDataQuery, toUserReservesDataQuery, toReservesIncentivesDataQuery] as const,
    selector
  );
};
