import { ReservesIncentiveDataHumanized } from '@aave/contract-helpers';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { UiIncentivesServiceMarketDataType } from 'src/services/UIIncentivesService';
import { POLLING_INTERVAL, queryKeysFactory, QueryMarketDataType } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export type UsePoolsReservesIncentivesHumanizedMarketDataType = UiIncentivesServiceMarketDataType &
  QueryMarketDataType;

export const usePoolsReservesIncentivesHumanized = <T = ReservesIncentiveDataHumanized[]>(
  marketsData: UsePoolsReservesIncentivesHumanizedMarketDataType[],
  opts?: HookOpts<ReservesIncentiveDataHumanized[], T>
) => {
  const { uiIncentivesService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: queryKeysFactory.poolReservesIncentiveDataHumanized(marketData),
          queryFn: () => uiIncentivesService.getReservesIncentivesDataHumanized(marketData),
          refetchInterval: POLLING_INTERVAL,
          ...opts,
        } as UseQueryOptions<ReservesIncentiveDataHumanized[], Error>)
    ),
  });
};

export const usePoolReservesIncentivesHumanized = (
  marketData: UsePoolsReservesIncentivesHumanizedMarketDataType
) => {
  return usePoolsReservesIncentivesHumanized([marketData])[0];
};
