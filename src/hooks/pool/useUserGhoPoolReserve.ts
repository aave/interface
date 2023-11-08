import { GhoUserData } from '@aave/math-utils';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const useUserGhoPoolsReserve = <T = GhoUserData>(
  marketsData: MarketDataType[],
  opts?: HookOpts<GhoUserData, T>
) => {
  const { uiGhoService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: [QueryKeys.GHO_USER_RESERVE_DATA, marketData],
          queryFn: () => uiGhoService.getGhoUserData(marketData, user),
          refetchInterval: POLLING_INTERVAL,
          ...opts,
        } as UseQueryOptions<GhoUserData, Error, T>)
    ),
  });
};

export const useUserGhoPoolReserve = <T = GhoUserData>(
  marketData: MarketDataType,
  opts?: HookOpts<GhoUserData, T>
) => {
  return useUserGhoPoolsReserve([marketData], opts)[0];
};
