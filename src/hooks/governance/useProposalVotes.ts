import { ChainId } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { governanceV3Config } from 'src/ui-config/governanceConfig';

export type ProposalVote = {
  proposalId: string;
  support: boolean;
  voter: string;
  votingPower: string;
};

export interface ProposalVotes {
  yaeVotes: ProposalVote[];
  nayVotes: ProposalVote[];
  combinedVotes: ProposalVote[];
  isFetching: boolean;
}

const getProposalVotes = gql`
  query getProposalVotes($proposalId: String!) {
    voteEmitteds(where: { proposalId: $proposalId }) {
      proposalId
      support
      voter
      votingPower
    }
  }
`;

export const useProposalVotesQuery = ({
  proposalId,
  votingChainId,
}: {
  proposalId: string;
  votingChainId: ChainId | undefined;
}) => {
  return useQuery({
    queryFn: () =>
      request<{ voteEmitteds: ProposalVote[] }>(
        governanceV3Config.votingChainConfig[votingChainId as ChainId].subgraphUrl,
        getProposalVotes,
        {
          proposalId,
        }
      ),
    queryKey: ['proposalVotes', proposalId],
    enabled: votingChainId !== undefined,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) =>
      data.voteEmitteds.map((vote) => ({
        ...vote,
        votingPower: normalizeBN(vote.votingPower, 18).toString(),
      })),
  });
};

const sortByVotingPower = (a: ProposalVote, b: ProposalVote) => {
  return +a.votingPower < +b.votingPower ? 1 : +a.votingPower > +b.votingPower ? -1 : 0;
};

export const useProposalVotes = ({
  proposalId,
  votingChainId,
}: {
  proposalId: string;
  votingChainId: ChainId | undefined;
}): ProposalVotes => {
  const { data, isFetching } = useProposalVotesQuery({ proposalId, votingChainId });

  return {
    yaeVotes: data?.filter((vote) => vote.support === true).sort(sortByVotingPower) || [],
    nayVotes: data?.filter((vote) => vote.support === false).sort(sortByVotingPower) || [],
    combinedVotes: data?.sort(sortByVotingPower) || [],
    isFetching,
  };
};
