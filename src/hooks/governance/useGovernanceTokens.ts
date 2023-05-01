import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useGovernanceTokens = () => {
  const { governanceWalletBalanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => governanceWalletBalanceService.getGovernanceTokensBalance({ user }),
    queryKey: [QueryKeys.GOVERNANCE_TOKENS, user, governanceWalletBalanceService.toHash()],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
    initialData: {
      aave: '0',
      stkAave: '0',
      aAave: '0',
    },
  });
};
