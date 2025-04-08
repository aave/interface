import { ReservesDataHumanized, ReservesIncentiveDataHumanized } from '@aave/contract-helpers';
import memoize from 'micro-memoize';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';
import { PoolReserve } from 'src/store/poolSlice';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { usePoolReservesHumanized } from '../pool/usePoolReserves';
import { usePoolReservesIncentivesHumanized } from '../pool/usePoolReservesIncentives';
import { useUserPoolReservesHumanized } from '../pool/useUserPoolReserves';
import { combineQueries, SimplifiedUseQueryResult } from '../pool/utils';

const selector = memoize(
  (
    reservesData: ReservesDataHumanized,
    userReservesData: UserReservesDataHumanized,
    reservesIncentivesData: ReservesIncentiveDataHumanized[]
  ) => {
    return {
      reserves: reservesData.reservesData,
      reservesIncentives: reservesIncentivesData,
      baseCurrencyData: reservesData.baseCurrencyData,
      userEmodeCategoryId: userReservesData.userEmodeCategoryId,
      userReserves: userReservesData.userReserves,
    };
  }
);

export const usePoolReserve = (
  marketData: MarketDataType
): SimplifiedUseQueryResult<PoolReserve> => {
  const toReservesDataQuery = usePoolReservesHumanized(marketData);
  const toUserReservesDataQuery = useUserPoolReservesHumanized(marketData);
  const toReservesIncentivesDataQuery = usePoolReservesIncentivesHumanized(marketData);

  return combineQueries(
    [toReservesDataQuery, toUserReservesDataQuery, toReservesIncentivesDataQuery] as const,
    selector
  );
};
