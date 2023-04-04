import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseVoteOnProposalArgs = {
  proposalId: number;
};

export const useVoteOnProposal = ({ proposalId }: UseVoteOnProposalArgs) => {
  const { governanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => governanceService.getVoteOnProposal({ proposalId, user }),
    queryKey: [QueryKeys.VOTE_ON_PROPOSAL, user, proposalId, governanceService.toHash()],
    enabled: !!user,
  });
};
