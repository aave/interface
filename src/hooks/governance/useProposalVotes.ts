import { ChainId } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { getENSClient } from 'src/utils/marketsAndNetworksConfig';
import { subgraphRequest } from 'src/utils/subgraphRequest';

export type ProposalVote = {
  proposalId: string;
  support: boolean;
  voter: string;
  votingPower: string;
};

export type EnhancedProposalVote = ProposalVote & {
  ensName?: string;
};

export interface ProposalVotes {
  yaeVotes: ProposalVote[];
  nayVotes: ProposalVote[];
  combinedVotes: ProposalVote[];
  isFetching: boolean;
}

const viemClient = getENSClient();

const getProposalVotes = gql`
  query getProposalVotes($proposalId: Int!) {
    voteEmitteds(where: { proposalId: $proposalId }) {
      proposalId
      support
      voter
      votingPower
    }
  }
`;

const fetchProposalVotes = async (
  proposalId: number,
  votingChainId: ChainId
): Promise<ProposalVote[]> => {
  const config = governanceV3Config.votingChainConfig[votingChainId as ChainId];
  const data = await subgraphRequest<{ voteEmitteds: ProposalVote[] }>(
    config.subgraphKey,
    getProposalVotes,
    {
      proposalId,
    }
  );
  return data.voteEmitteds.map((vote) => ({
    ...vote,
    votingPower: normalizeBN(vote.votingPower, 18).toString(),
  }));
};

const fetchProposalVotesEnsNames = async (addresses: string[]): Promise<string[]> => {
  const names = await Promise.all(
    addresses.map((addr) =>
      viemClient.getEnsName({ address: addr as `0x${string}` }).catch(() => null)
    )
  );
  return names.map((name) => name ?? '');
};

export const useProposalVotesQuery = ({
  proposalId,
  votingChainId,
}: {
  proposalId: number;
  votingChainId: ChainId | undefined;
}): UseQueryResult<EnhancedProposalVote[]> => {
  return useQuery({
    queryFn: async () => {
      const votes = await fetchProposalVotes(proposalId, votingChainId as ChainId);
      const votesEnsNames = await fetchProposalVotesEnsNames(votes.map((vote) => vote.voter));
      return votes.map((vote, index) => ({ ...vote, ensName: votesEnsNames[index] }));
    },
    queryKey: ['proposalVotes', proposalId],
    enabled: votingChainId !== undefined && !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

const sortByVotingPower = (a: ProposalVote, b: ProposalVote) => {
  return +a.votingPower < +b.votingPower ? 1 : +a.votingPower > +b.votingPower ? -1 : 0;
};

export const useProposalVotes = ({
  proposalId,
  votingChainId,
}: {
  proposalId: number;
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
