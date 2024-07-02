import { GhoUserData } from '@aave/math-utils';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import { GHO_MINTING_MARKETS } from 'src/utils/ghoUtilities';

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
          queryKey: queryKeysFactory.ghoUserReserveData(user, marketData),
          queryFn: () => uiGhoService.getGhoUserData(marketData, user),
          refetchInterval: POLLING_INTERVAL,
          enabled: !!user && GHO_MINTING_MARKETS.includes(marketData.market),
          ...opts,
        } as UseQueryOptions<GhoUserData | null, Error, T>)
    ),
  });
};

export const useUserGhoPoolReserve = <T = GhoUserData>(
  marketData: MarketDataType,
  opts?: HookOpts<GhoUserData, T>
) => {
  return useUserGhoPoolsReserve([marketData], opts)[0];
};
