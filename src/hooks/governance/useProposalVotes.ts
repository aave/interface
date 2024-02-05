import { ChainId } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Contract } from 'ethers';
import request, { gql } from 'graphql-request';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

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

const abi = [
  {
    inputs: [{ internalType: 'contract ENS', name: '_ens', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'address[]', name: 'addresses', type: 'address[]' }],
    name: 'getNames',
    outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
];

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
  const data = await request<{ voteEmitteds: ProposalVote[] }>(
    governanceV3Config.votingChainConfig[votingChainId as ChainId].subgraphUrl,
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

const fetchProposalVotesEnsNames = async (addresses: string[]) => {
  const provider = getProvider(governanceV3Config.coreChainId);
  const contract = new Contract('0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', abi);
  const connectedContract = contract.connect(provider);
  return connectedContract.getNames(addresses) as Promise<string[]>;
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
