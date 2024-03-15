import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useBridgeTokens = (chainId: number, currentMarketData) => {
  const { poolTokensBalanceService } = useSharedDependencies();
  //   const currentMarketData = useRootStore((store) => store.currentMarketData);
  const user = useRootStore((store) => store.account);

  return useQuery({
    queryFn: () =>
      poolTokensBalanceService.getGhoBridgeBalancesTokenBalances(currentMarketData, user),
    queryKey: queryKeysFactory.getGhoBridgeBalances(user, currentMarketData),
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
    initialData: {
      bridgeTokenBalance: '0',
    },
  });
};
