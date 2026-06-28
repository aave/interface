import { ReservesDataHumanized, ReservesIncentiveDataHumanized } from '@aave/contract-helpers';
import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';
import { selectFormatUserSummaryForMigration } from 'src/store/v3MigrationSelectors';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { usePoolReservesHumanized } from '../pool/usePoolReserves';
import { usePoolReservesIncentivesHumanized } from '../pool/usePoolReservesIncentives';
import { useUserPoolReservesHumanized } from '../pool/useUserPoolReserves';
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

export const useUserSummaryForMigration = (marketData: MarketDataType) => {
  const toReservesDataQuery = usePoolReservesHumanized(marketData);
  const toUserReservesDataQuery = useUserPoolReservesHumanized(marketData);
  const toReservesIncentivesDataQuery = usePoolReservesIncentivesHumanized(marketData);

  return combineQueries(
    [toReservesDataQuery, toUserReservesDataQuery, toReservesIncentivesDataQuery] as const,
    selector
  );
};
