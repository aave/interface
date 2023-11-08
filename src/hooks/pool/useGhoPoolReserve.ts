import { GhoReserveData } from '@aave/math-utils';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const useGhoPoolsReserve = <T = GhoReserveData>(
  marketsData: MarketDataType[],
  opts?: HookOpts<GhoReserveData, T>
) => {
  const { uiGhoService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: [QueryKeys.GHO_RESERVE_DATA, marketData],
          queryFn: () => uiGhoService.getGhoReserveData(marketData),
          refetchInterval: POLLING_INTERVAL,
          ...opts,
        } as UseQueryOptions<GhoReserveData, Error, T>)
    ),
  });
};

export const useGhoPoolReserve = <T = GhoReserveData>(
  marketData: MarketDataType,
  opts?: HookOpts<GhoReserveData, T>
) => {
  return useGhoPoolsReserve([marketData], opts)[0];
};
