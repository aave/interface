import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseGovernanceTokensParams = {
  user: string;
};

export const useGovernanceTokens = ({ user }: UseGovernanceTokensParams) => {
  const { governanceWalletBalanceService } = useSharedDependencies();
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
