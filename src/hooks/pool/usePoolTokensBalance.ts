import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const usePoolTokensBalance = () => {
  const { poolTokensBalanceService } = useSharedDependencies();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const user = useRootStore((store) => store.account);
  const lendingPoolAddressProvider = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL;
  return useQuery({
    queryFn: () =>
      poolTokensBalanceService.getPoolTokensBalances({ user, lendingPoolAddressProvider }),
    queryKey: [
      QueryKeys.POOL_TOKENS,
      user,
      lendingPoolAddressProvider,
      lendingPoolAddress,
      poolTokensBalanceService.toHash(),
    ],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};
