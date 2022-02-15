import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

type APIResponse = {
  liquidityRate_avg: number;
  variableBorrowRate_avg: number;
  stableBorrowRate_avg: number;
  utilizationRate_avg: number;
  x: { year: number; month: number; date: number; hours: number };
};

const fetchStats = async (address: string, endpointURL: string) => {
  const thirtyDaysAgo = dayjs().subtract(30, 'day').unix();
  try {
    const result = await fetch(
      `${endpointURL}?reserveId=${address}&from=${thirtyDaysAgo}&resolutionInHours=6`
    );
    const json = await result.json();
    return json;
  } catch (e) {
    return [];
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
export function useReserveRatesHistory(reserveAddress: string) {
  const { currentNetworkConfig } = useProtocolDataContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FormattedReserveHistoryItem[]>([]);

  useEffect(() => {
    if (
      reserveAddress &&
      currentNetworkConfig.ratesHistoryApiUrl &&
      !BROKEN_ASSETS.includes(reserveAddress)
    ) {
      fetchStats(reserveAddress, currentNetworkConfig.ratesHistoryApiUrl).then(
        (data: APIResponse[]) => {
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
        }
      );
    } else {
      setLoading(false);
    }
  }, [reserveAddress, currentNetworkConfig]);

  return {
    loading,
    data,
  };
}
