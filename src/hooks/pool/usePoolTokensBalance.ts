import { useQuery } from '@tanstack/react-query';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const usePoolsTokensBalance = <T = UserPoolTokensBalances[]>(
  marketsData: MarketDataType[],
  user: string,
  opts?: HookOpts<UserPoolTokensBalances[][], T>
) => {
  const { poolTokensBalanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () =>
      Promise.all(
        marketsData.map((marketData) =>
          poolTokensBalanceService.getPoolTokensBalances(marketData, user)
        )
      ),
    queryKey: [QueryKeys.POOL_TOKENS, user, marketsData],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
    ...opts,
  });
};

export const usePoolTokensBalance = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const user = useRootStore((store) => store.account);
  return usePoolsTokensBalance([currentMarketData], user, { select: (value) => value[0] });
};
