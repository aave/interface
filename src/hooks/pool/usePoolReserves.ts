import { ReservesDataHumanized } from '@aave/contract-helpers';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { UiPoolMarketDataType } from 'src/services/UIPoolService';
import { POLLING_INTERVAL, queryKeysFactory, QueryMarketDataType } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export type UsePoolsReservesHumanizedMarketDataType = UiPoolMarketDataType & QueryMarketDataType;

export const usePoolsReservesHumanized = <T = ReservesDataHumanized>(
  marketsData: UsePoolsReservesHumanizedMarketDataType[],
  opts?: HookOpts<ReservesDataHumanized, T>
) => {
  const { uiPoolService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: queryKeysFactory.poolReservesDataHumanized(marketData),
          queryFn: () => uiPoolService.getReservesHumanized(marketData),
          refetchInterval: POLLING_INTERVAL,
          meta: {},
          ...opts,
        } as UseQueryOptions<ReservesDataHumanized, Error, T>)
    ),
  });
};

export const usePoolReservesHumanized = (marketData: UsePoolsReservesHumanizedMarketDataType) => {
  return usePoolsReservesHumanized([marketData])[0];
};
