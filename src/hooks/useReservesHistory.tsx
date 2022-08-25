import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { makeCancelable } from 'src/utils/utils';

export const reserveRateTimeRangeOptions = ['1m', '6m', '1y', 'Max'] as const;
export type ReserveRateTimeRange = typeof reserveRateTimeRangeOptions[number];

type APIResponse = {
  liquidityRate_avg: number;
  variableBorrowRate_avg: number;
  stableBorrowRate_avg: number;
  utilizationRate_avg: number;
  x: { year: number; month: number; date: number; hours: number };
};

const fetchStats = async (
  address: string,
  timeRange: ReserveRateTimeRange,
  endpointURL: string
) => {
  const { from, resolutionInHours } = resolutionForTimeRange(timeRange);
  try {
    const result = await fetch(
      `${endpointURL}?reserveId=${address}&from=${from}&resolutionInHours=${resolutionInHours}`
    );
    const json = await result.json();
    return json;
  } catch (e) {
    return [];
  }
};

// TODO: Just threw in some initial values, need to evaluate and test what good
// resolution values are for the selected time range.
// Also, not sure how we can determine a good resolution when the max
// is selected, because we don't know how much data there is up front.
const resolutionForTimeRange = (timeRange: ReserveRateTimeRange) => {
  switch (timeRange) {
    case '1m':
      return {
        from: dayjs().subtract(30, 'day').unix(),
        resolutionInHours: 24,
      };
    case '6m':
      return {
        from: dayjs().subtract(6, 'month').unix(),
        resolutionInHours: 24,
      };
    case '1y':
      return {
        from: dayjs().subtract(1, 'year').unix(),
        resolutionInHours: 168, // 1 week
      };
    case 'Max':
      return {
        from: dayjs().subtract(10, 'year').unix(),
        resolutionInHours: 168,
      };
  }
};

export type FormattedReserveHistoryItem = {
  date: number;
  liquidityRate: number;
  utilizationRate: number;
  stableBorrowRate: number;
  variableBorrowRate: number;
};

const BROKEN_ASSETS = [
  // ampl https://governance.aave.com/t/arc-fix-ui-bugs-in-reserve-overview-for-ampl/5885/5?u=sakulstra
  '0xd46ba6d942050d489dbd938a2c909a5d5039a1610xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
];

// TODO: api need to be altered to expect chainId underlying asset and poolConfig
export function useReserveRatesHistory(reserveAddress: string, timeRange: ReserveRateTimeRange) {
  const { currentNetworkConfig } = useProtocolDataContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FormattedReserveHistoryItem[]>([]);

  useEffect(() => {
    if (
      reserveAddress &&
      currentNetworkConfig.ratesHistoryApiUrl &&
      !BROKEN_ASSETS.includes(reserveAddress)
    ) {
      setLoading(true);
      const cancelable = makeCancelable(
        fetchStats(reserveAddress, timeRange, currentNetworkConfig.ratesHistoryApiUrl)
      );
      cancelable.promise
        .then((data: APIResponse[]) => {
          setData(
            data.map((d) => ({
              date: new Date(d.x.year, d.x.month, d.x.date, d.x.hours).getTime(),
              liquidityRate: d.liquidityRate_avg,
              variableBorrowRate: d.variableBorrowRate_avg,
              utilizationRate: d.utilizationRate_avg,
              stableBorrowRate: d.stableBorrowRate_avg,
            }))
          );
          setLoading(false);
        })
        .catch((e) => console.log('error fetching result', e));
      return cancelable.cancel;
    } else {
      setLoading(false);
    }
  }, [reserveAddress, timeRange, currentNetworkConfig]);

  return {
    loading,
    data,
    error: BROKEN_ASSETS.includes(reserveAddress) || (!loading && data.length === 0),
  };
}
