import { useQueries } from '@tanstack/react-query';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const usePoolsTokensBalance = <T = UserPoolTokensBalances[]>(
  marketsData: MarketDataType[],
  user: string,
  opts?: HookOpts<UserPoolTokensBalances[], T>
) => {
  const { poolTokensBalanceService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map((marketData) => ({
      queryKey: queryKeysFactory.poolTokens(user, marketData),
      queryFn: () => poolTokensBalanceService.getPoolTokensBalances(marketData, user),
      enabled: !!user,
      refetchInterval: POLLING_INTERVAL,
      ...opts,
    })),
  });
};

export const usePoolTokensBalance = (marketData: MarketDataType) => {
  const user = useRootStore((store) => store.account);
  return usePoolsTokensBalance([marketData], user)[0];
};
