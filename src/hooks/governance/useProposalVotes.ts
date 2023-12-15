import { normalizeBN } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';

export type ProposalVote = {
  proposalId: string;
  support: boolean;
  voter: string;
  votingPower: string;
};

export interface ProposalVotes {
  yaeVotes: ProposalVote[],
  nayVotes: ProposalVote[],
  combinedVotes: ProposalVote[],
  isFetching: boolean,
}

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

const sortByVotingPower = (a: ProposalVote, b: ProposalVote) => {
  return a.votingPower < b.votingPower ? 1 : a.votingPower > b.votingPower ? -1 : 0;
};

export const useProposalVotes = ({ proposalId }: { proposalId: string }): ProposalVotes => {
  const { data, isFetching } = useProposalVotesQuery({ proposalId });

  return {
    yaeVotes: data?.filter((vote) => vote.support === true).sort(sortByVotingPower) || [],
    nayVotes: data?.filter((vote) => vote.support === false).sort(sortByVotingPower) || [],
    combinedVotes: data?.sort(sortByVotingPower) || [],
    isFetching,
  };
};
