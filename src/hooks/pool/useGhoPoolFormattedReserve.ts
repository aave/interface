import { formatGhoReserveData, GhoReserveData } from '@aave/math-utils';
import { memoize } from 'lodash';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { useGhoPoolsReserve } from './useGhoPoolReserve';

const selector = memoize((ghoReserveData: GhoReserveData) => {
  return formatGhoReserveData({ ghoReserveData });
});

export const useGhoPoolsFormattedReserve = (marketsData: MarketDataType[]) => {
  return useGhoPoolsReserve(marketsData, { select: selector });
};

export const useGhoPoolFormattedReserve = (marketData: MarketDataType) => {
  return useGhoPoolsFormattedReserve([marketData])[0];
};
