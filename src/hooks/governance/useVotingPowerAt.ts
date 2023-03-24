import { useQuery } from '@tanstack/react-query';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const USE_VOTING_POWER_AT_KEY = 'USE_VOTING_POWER_AT';

type UseVotingPowerAtArgs = {
  strategy: string;
  block: number;
  user: string;
};

export const useVotingPowerAt = ({ strategy, block, user }: UseVotingPowerAtArgs) => {
  const { governanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceService.getVotingPowerAt({ user, strategy, block }),
    queryKey: [USE_VOTING_POWER_AT_KEY, user, strategy, block],
    enabled: !!user,
  });
};
