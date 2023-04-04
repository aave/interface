import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseVoteOnProposalArgs = {
  proposalId: number;
  user: string;
};

export const useVoteOnProposal = ({ proposalId, user }: UseVoteOnProposalArgs) => {
  const { governanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceService.getVoteOnProposal({ proposalId, user }),
    queryKey: [QueryKeys.VOTE_ON_PROPOSAL, user, proposalId, governanceService.toHash()],
    enabled: !!user,
  });
};
