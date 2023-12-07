import { normalizeBN } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';

type ProposalVote = {
  proposalId: string;
  support: boolean;
  voter: string;
  votingPower: string;
};

const VOTING_MACHING_SUBGRAPH_URL =
  'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/votingmachine-sepolia/v1/gn';

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

export const useProposalVotesQuery = ({ proposalId }: { proposalId: string }) => {
  return useQuery({
    queryFn: () =>
      request<{ voteEmitteds: ProposalVote[] }>(VOTING_MACHING_SUBGRAPH_URL, getProposalVotes, {
        proposalId,
      }),
    queryKey: ['proposalVotes', proposalId],
    enabled: true,
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

export const useProposalVotes = ({ proposalId }: { proposalId: string }) => {
  const { data, isFetching } = useProposalVotesQuery({ proposalId });

  return {
    yaeVotes: data?.filter((vote) => vote.support === true) || [],
    nayVotes: data?.filter((vote) => vote.support === false) || [],
    isFetching,
  };
};
