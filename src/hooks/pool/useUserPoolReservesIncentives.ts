import { UserReservesIncentivesDataHumanized } from '@aave/contract-helpers';
import { useQueries } from '@tanstack/react-query';
import { UiIncentivesServiceMarketDataType } from 'src/services/UIIncentivesService';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, queryKeysFactory, QueryMarketDataType } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export type UseUserPoolsReservesIncentivesHumanizedMarketDataType = QueryMarketDataType &
  UiIncentivesServiceMarketDataType;

export const useUserPoolsReservesIncentivesHumanized = <T = UserReservesIncentivesDataHumanized[]>(
  marketsData: UseUserPoolsReservesIncentivesHumanizedMarketDataType[],
  opts?: HookOpts<UserReservesIncentivesDataHumanized[], T>
) => {
  const { uiIncentivesService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQueries({
    queries: marketsData.map((marketData) => ({
      queryKey: queryKeysFactory.userPoolReservesIncentiveDataHumanized(user, marketData),
      queryFn: () => uiIncentivesService.getUserReservesIncentivesData(marketData, user),

      enabled: !!user,
      refetchInterval: POLLING_INTERVAL,
      ...opts,
    })),
  });
};

export const useUserPoolReservesIncentivesHumanized = (
  marketData: UseUserPoolsReservesIncentivesHumanizedMarketDataType
) => {
  return useUserPoolsReservesIncentivesHumanized([marketData])[0];
};
