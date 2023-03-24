import { useQuery } from '@tanstack/react-query';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const USE_VOTE_ON_PROPOSAL_KEY = 'USE_VOTE_ON_PROPOSAL';

type UseVoteOnProposalArgs = {
  proposalId: number;
  user: string;
};

export const useVoteOnProposal = ({ proposalId, user }: UseVoteOnProposalArgs) => {
  const { governanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceService.getVoteOnProposal({ proposalId, user }),
    queryKey: [USE_VOTE_ON_PROPOSAL_KEY, user, proposalId],
    enabled: !!user,
  });
};
