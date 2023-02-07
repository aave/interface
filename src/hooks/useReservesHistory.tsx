/**
 * This hook is used for getting historical reserve data, and it is primarily used with charts.
 * In particular, this hook is used in the ApyGraph.
 */
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { makeCancelable } from 'src/utils/utils';

export const reserveRateTimeRangeOptions = ['1m', '6m', '1y'] as const;
export type ReserveRateTimeRange = typeof reserveRateTimeRangeOptions[number];

type RatesHistoryParams = {
  from: number;
  resolutionInHours: number;
};

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
    const url = `${endpointURL}?reserveId=${address}&from=${from}&resolutionInHours=${resolutionInHours}`;
    const result = await fetch(url);
    const json = await result.json();
    return json;
  } catch (e) {
    return [];
  }
};

// TODO: there is possibly a bug here, as Polygon and Avalanche v2 data is coming through empty and erroring in our hook
// The same asset without the 'from' field comes through just fine.
const resolutionForTimeRange = (timeRange: ReserveRateTimeRange): RatesHistoryParams => {
  switch (timeRange) {
    case '1m':
      return {
        from: dayjs().subtract(30, 'day').unix(),
        resolutionInHours: 6,
      };
    case '6m':
      return {
        from: dayjs().subtract(6, 'month').unix(),
        resolutionInHours: 24,
      };
    case '1y':
      return {
        from: dayjs().subtract(1, 'year').unix(),
        resolutionInHours: 24,
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

/**
 * Broken Assets:
 * A list of assets that currently are broken in some way, i.e. has bad data from either the subgraph or backend server
 * Each item represents the ID of the asset, not the underlying address it's deployed to, appended with LendingPoolAddressProvider
 * contract address it is held in. So each item in the array is essentially [underlyingAssetId + LendingPoolAddressProvider address].
 */
export const BROKEN_ASSETS = [
  // ampl https://governance.aave.com/t/arc-fix-ui-bugs-in-reserve-overview-for-ampl/5885/5?u=sakulstra
  '0xd46ba6d942050d489dbd938a2c909a5d5039a1610xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
  // fei usd (v2 eth mainnet)
  '0x956f47f50a910163d8bf957cf5846d573e7f87ca0xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
];

// TODO: api need to be altered to expect chainId underlying asset and poolConfig
export function useReserveRatesHistory(reserveAddress: string, timeRange: ReserveRateTimeRange) {
  const { currentNetworkConfig } = useProtocolDataContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<FormattedReserveHistoryItem[]>([]);

  const ratesHistoryApiUrl = currentNetworkConfig?.ratesHistoryApiUrl;

  const refetchData = useCallback<() => () => void>(() => {
    // reset
    setLoading(true);
    setError(false);
    setData([]);

    if (reserveAddress && ratesHistoryApiUrl && !BROKEN_ASSETS.includes(reserveAddress)) {
      const cancelable = makeCancelable(fetchStats(reserveAddress, timeRange, ratesHistoryApiUrl));

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
        .catch((e) => {
          console.error('useReservesHistory(): Failed to fetch historical reserve data.', e);
          setError(true);
          setLoading(false);
        });

      return cancelable.cancel;
    }

    setLoading(false);
    return () => null;
  }, [reserveAddress, timeRange, ratesHistoryApiUrl]);

  useEffect(() => {
    const cancel = refetchData();
    return () => cancel();
  }, [refetchData]);

  return {
    loading,
    data,
    error: error || BROKEN_ASSETS.includes(reserveAddress) || (!loading && data.length === 0),
    refetch: refetchData,
  };
}
