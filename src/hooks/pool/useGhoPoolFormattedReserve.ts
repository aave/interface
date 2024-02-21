import { ReservesDataHumanized } from '@aave/contract-helpers';
import { formatGhoReserveData, GhoReserveData } from '@aave/math-utils';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';

import { useGhoPoolsReserve } from './useGhoPoolReserve';
import { usePoolsReservesHumanized } from './usePoolReserves';
import { combineQueries } from './utils';

const selector = (ghoReserveData: GhoReserveData, reservesData: ReservesDataHumanized) => {
  const formattedGhoReserveData = formatGhoReserveData({ ghoReserveData });
  let aaveFacilitatorRemainingCapacity = Math.max(
    formattedGhoReserveData.aaveFacilitatorRemainingCapacity - 0.000001,
    0
  );
  const ghoReserveBorrowCap = reservesData.reservesData.find(
    (elem) => elem.symbol === GHO_SYMBOL
  )?.borrowCap;
  if (ghoReserveBorrowCap && ghoReserveBorrowCap !== '0') {
    aaveFacilitatorRemainingCapacity = Number(ghoReserveBorrowCap);
  }
  return {
    ...formattedGhoReserveData,
    aaveFacilitatorRemainingCapacity,
  };
};

export const useGhoPoolsFormattedReserve = (marketsData: MarketDataType[]) => {
  const ghoReservesQueries = useGhoPoolsReserve(marketsData);
  const reservesQueries = usePoolsReservesHumanized(marketsData);

  return ghoReservesQueries.map((elem, index) => {
    return combineQueries([elem, reservesQueries[index]] as const, selector);
  });
};

export const useGhoPoolFormattedReserve = (marketData: MarketDataType) => {
  return useGhoPoolsFormattedReserve([marketData])[0];
};
