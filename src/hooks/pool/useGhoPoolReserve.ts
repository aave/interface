import { GhoReserveData } from '@aave/math-utils';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import { GHO_MINTING_MARKETS } from 'src/utils/ghoUtilities';

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
          queryKey: queryKeysFactory.ghoReserveData(marketData),
          queryFn: () => uiGhoService.getGhoReserveData(marketData),
          enabled: GHO_MINTING_MARKETS.includes(marketData.market),
          refetchInterval: POLLING_INTERVAL,
          ...opts,
        } as UseQueryOptions<GhoReserveData | null, Error, T>)
    ),
  });
};

export const useGhoPoolReserve = <T = GhoReserveData>(
  marketData: MarketDataType,
  opts?: HookOpts<GhoReserveData, T>
) => {
  return useGhoPoolsReserve([marketData], opts)[0];
};
