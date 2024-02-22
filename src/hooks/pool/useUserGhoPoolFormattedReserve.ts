import { formatGhoUserData, GhoReserveData, GhoUserData } from '@aave/math-utils';
import dayjs from 'dayjs';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { useGhoPoolsReserve } from './useGhoPoolReserve';
import { useUserGhoPoolsReserve } from './useUserGhoPoolReserve';
import { combineQueries } from './utils';

const selector = (ghoReserveData: GhoReserveData, ghoUserData: GhoUserData) => {
  return formatGhoUserData({
    ghoReserveData,
    ghoUserData,
    currentTimestamp: dayjs().unix(),
  });
};

export const useUserGhoPoolsFormattedReserve = (marketsData: MarketDataType[]) => {
  const ghoReserveQuery = useGhoPoolsReserve(marketsData);
  const userGhoReservesQuery = useUserGhoPoolsReserve(marketsData);

  return ghoReserveQuery.map((elem, index) => {
    return combineQueries([elem, userGhoReservesQuery[index]] as const, selector);
  });
};

export const useUserGhoPoolFormattedReserve = (marketData: MarketDataType) => {
  return useUserGhoPoolsFormattedReserve([marketData])[0];
};
