import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseVotingPowerAtArgs = {
  strategy: string;
  block: number;
  user: string;
};

export const useVotingPowerAt = ({
  strategy,
  block,
  user,
}: UseVotingPowerAtArgs): UseQueryResult<string, Error> => {
  const { governanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceService.getVotingPowerAt({ user, strategy, block }),
    queryKey: [QueryKeys.VOTING_POWER_AT, user, strategy, block, governanceService.toHash()],
    enabled: !!user,
  });
};
