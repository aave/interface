import { useQuery } from '@tanstack/react-query';
import { POOLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UsePoolTokensBalance = {
  user: string;
  poolAddress: string;
};

export const usePoolTokensBalance = ({ user, poolAddress }: UsePoolTokensBalance) => {
  const { poolTokensBalanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () => poolTokensBalanceService.getPoolTokensBalances({ user, poolAddress }),
    queryKey: [QueryKeys.POOL_TOKENS, user, poolAddress],
    enabled: !!user,
    refetchInterval: POOLING_INTERVAL,
  });
};
