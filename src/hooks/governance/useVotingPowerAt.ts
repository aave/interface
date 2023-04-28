import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseVotingPowerAtArgs = {
  strategy: string;
  block: number;
};

export const useVotingPowerAt = ({ strategy, block }: UseVotingPowerAtArgs) => {
  const { governanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => governanceService.getVotingPowerAt({ user, strategy, block }),
    queryKey: [QueryKeys.VOTING_POWER_AT, user, strategy, block, governanceService.toHash()],
    enabled: !!user,
  });
};
