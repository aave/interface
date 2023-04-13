import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UsePoolTokensBalance = {
  lendingPoolAddressProvider: string;
};

export const usePoolTokensBalance = ({ lendingPoolAddressProvider }: UsePoolTokensBalance) => {
  const { poolTokensBalanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () =>
      poolTokensBalanceService.getPoolTokensBalances({ user, lendingPoolAddressProvider }),
    queryKey: [
      QueryKeys.POOL_TOKENS,
      user,
      lendingPoolAddressProvider,
      poolTokensBalanceService.toHash(),
    ],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};
