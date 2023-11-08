import { ReservesIncentiveDataHumanized } from '@aave/contract-helpers';
import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const usePoolsReservesIncentivesHumanized = <T = ReservesIncentiveDataHumanized[]>(
  marketsData: MarketDataType[],
  opts?: HookOpts<ReservesIncentiveDataHumanized[], T>
) => {
  const { uiIncentivesService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: [QueryKeys.POOL_RESERVES_INCENTIVE_DATA_HUMANIZED, marketData],
          queryFn: () => uiIncentivesService.getReservesIncentivesDataHumanized(marketData),
          refetchInterval: POLLING_INTERVAL,
          ...opts,
        } as UseQueryOptions<ReservesIncentiveDataHumanized[], Error>)
    ),
  });
};

export const usePoolReservesIncentivesHumanized = (marketData: MarketDataType) => {
  return usePoolsReservesIncentivesHumanized([marketData])[0];
};
