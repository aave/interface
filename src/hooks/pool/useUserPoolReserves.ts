import { useQueries } from '@tanstack/react-query';
import { withSimulatedPosition } from 'src/modules/dynamic-caps/simulatedWallet';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const useUserPoolsReservesHumanized = <T = UserReservesDataHumanized>(
  marketsData: MarketDataType[],
  opts?: HookOpts<UserReservesDataHumanized, T>
) => {
  const { uiPoolService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQueries({
    queries: marketsData.map((marketData) => ({
      queryKey: queryKeysFactory.userPoolReservesDataHumanized(user, marketData),
      // PREVIEW ONLY: a simulated wallet gets its simulated position; any other user is untouched.
      queryFn: async () =>
        withSimulatedPosition(
          await uiPoolService.getUserReservesHumanized(marketData, user),
          marketData.market,
          user
        ),
      enabled: !!user,
      refetchInterval: POLLING_INTERVAL,
      ...opts,
    })),
  });
};

export const useUserPoolReservesHumanized = (marketData: MarketDataType) => {
  return useUserPoolsReservesHumanized([marketData])[0];
};
