import { useQueries } from '@tanstack/react-query';
import { UiPoolMarketDataType, UserReservesDataHumanized } from 'src/services/UIPoolService';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, queryKeysFactory, QueryMarketDataType } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export type UseUserPoolsPoolReservesHumanizedMarketDataType = UiPoolMarketDataType &
  QueryMarketDataType;

export const useUserPoolsReservesHumanized = <T = UserReservesDataHumanized>(
  marketsData: UseUserPoolsPoolReservesHumanizedMarketDataType[],
  opts?: HookOpts<UserReservesDataHumanized, T>
) => {
  const { uiPoolService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQueries({
    queries: marketsData.map((marketData) => ({
      queryKey: queryKeysFactory.userPoolReservesDataHumanized(user, marketData),
      queryFn: () => uiPoolService.getUserReservesHumanized(marketData, user),
      enabled: !!user,
      refetchInterval: POLLING_INTERVAL,
      ...opts,
    })),
  });
};

export const useUserPoolReservesHumanized = (
  marketData: UseUserPoolsPoolReservesHumanizedMarketDataType
) => {
  return useUserPoolsReservesHumanized([marketData])[0];
};
