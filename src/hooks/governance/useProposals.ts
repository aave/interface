import { ProposalMetadata, ProposalV3State } from '@aave/contract-helpers';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import {
  getProposalMetadata,
  parseRawIpfs,
} from 'src/modules/governance/utils/getProposalMetadata';
import { VotingMachineService } from 'src/services/VotingMachineService';
import { governanceV3Config, ipfsGateway } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export interface SubgraphConstants {
  id: string;
  precisionDivider: string;
  cooldownPeriod: string;
  expirationTime: string;
  cancellationFee: string;
}
export interface SubgraphProposalVotes {
  id: string;
  forVotes: string;
  againstVotes: string;
}
export interface SubgraphTransactionData {
  id: string;
  blockNumber: string;
  timestamp: string;
}
export interface SubgraphProposalTransactions {
  id: string;
  created: SubgraphTransactionData;
  active: SubgraphTransactionData | null;
  queued: SubgraphTransactionData | null;
  failed: SubgraphTransactionData | null;
  executed: SubgraphTransactionData | null;
  canceled: SubgraphTransactionData | null;
}
export interface SubgraphPayload {
  id: string;
  chainId: string;
  accessLevel: string;
  payloadsController: string;
}
export interface SubgraphVotingConfig {
  id: string;
  cooldownBeforeVotingStart: string;
  votingDuration: string;
  yesThreshold: string;
  yesNoDifferential: string;
  minPropositionPower: string;
}
export interface SubgraphVotingPortal {
  id: string;
  votingMachineChainId: string;
  votingMachine: string;
  enabled: boolean;
}
export interface SubgraphProposalMetadata {
  id: string;
  title: string;
  rawContent: string;
}
export interface SubgraphProposal {
  id: string;
  creator: string;
  accessLevel: string;
  ipfsHash: string;
  proposalMetadata: SubgraphProposalMetadata | null;
  state: ProposalV3State;
  votingPortal: SubgraphVotingPortal;
  votingConfig: SubgraphVotingConfig;
  payloads: SubgraphPayload[];
  transactions: SubgraphProposalTransactions;
  votingDuration: string | null;
  snapshotBlockHash: string | null;
  votes: SubgraphProposalVotes | null;
  constants: SubgraphConstants;
}

export interface Proposal extends Omit<SubgraphProposal, 'proposalMetadata' | 'votes'> {
  proposalMetadata: ProposalMetadata;
  votes: {
    forVotes: string;
    againstVotes: string;
  };
}

const getProposalsQuery = gql`
  query getProposals($first: Int!, $skip: Int!) {
    proposals(orderBy: id, orderDirection: desc, first: $first, skip: $skip) {
      id
      creator
      accessLevel
      ipfsHash
      proposalMetadata {
        id
        title
        rawContent
      }
      state
      votingPortal {
        id
        votingMachineChainId
        votingMachine
        enabled
      }
      votingConfig {
        id
        cooldownBeforeVotingStart
        votingDuration
        yesThreshold
        yesNoDifferential
        minPropositionPower
      }
      payloads {
        id
        chainId
        accessLevel
        payloadsController
      }
      transactions {
        id
        created {
          id
          blockNumber
          timestamp
        }
        active {
          id
          blockNumber
          timestamp
        }
        queued {
          id
          blockNumber
          timestamp
        }
        failed {
          id
          blockNumber
          timestamp
        }
        executed {
          id
          blockNumber
          timestamp
        }
        canceled {
          id
          blockNumber
          timestamp
        }
      }
      votingDuration
      snapshotBlockHash
      votes {
        id
        forVotes
        againstVotes
      }
      constants {
        id
        precisionDivider
        cooldownPeriod
        expirationTime
        cancellationFee
      }
    }
  }
`;

export const enhanceProposalWithMetadata = async (proposal: SubgraphProposal) => {
  if (!proposal.proposalMetadata) {
    const metadata = await getProposalMetadata(proposal.ipfsHash, ipfsGateway);
    return {
      ...proposal,
      proposalMetadata: metadata,
    };
  } else {
    const metadata = await parseRawIpfs(proposal.proposalMetadata.rawContent, proposal.ipfsHash);
    return {
      ...proposal,
      proposalMetadata: metadata,
    };
  }
};

export const getProposals = (first: number, skip: number) =>
  request<{ proposals: SubgraphProposal[] }>(
    governanceV3Config.governanceCoreSubgraphUrl,
    getProposalsQuery,
    {
      first,
      skip,
    }
  );

const PAGE_SIZE = 10;

async function fetchProposals(pageParam: number, votingMachineSerivce: VotingMachineService) {
  const result = await getProposals(PAGE_SIZE, pageParam * PAGE_SIZE);
  const proposals = result.proposals;

  const proposalsWithMetadata = await Promise.all(
    proposals.map((proposal) => enhanceProposalWithMetadata(proposal))
  );

  const votingMachineParams =
    proposalsWithMetadata
      .filter((elem) => elem.state === ProposalV3State.Active)
      .map((p) => ({
        id: +p.id,
        snapshotBlockHash: p.snapshotBlockHash || '',
        chainId: +p.votingPortal.votingMachineChainId,
        votingMachineAddress: p.votingPortal.votingMachine,
      })) ?? [];

  const votingMachingData = await votingMachineSerivce.getProposalsData(votingMachineParams);

  console.log(proposalsWithMetadata);

  const proposalsWithVotes = proposalsWithMetadata.map<Proposal>((elem) => {
    if (elem.votes) {
      return {
        ...elem,
        votes: {
          forVotes: elem.votes.forVotes,
          againstVotes: elem.votes.againstVotes,
        },
      };
    }
    if (elem.state === ProposalV3State.Active) {
      const votingInfo = votingMachingData.find(
        (votingElem) => votingElem.proposalData.id === elem.id
      );
      if (votingInfo) {
        return {
          ...elem,
          votes: {
            forVotes: votingInfo.proposalData.forVotes,
            againstVotes: votingInfo.proposalData.againstVotes,
          },
        };
      }
    }
    return {
      ...elem,
      votes: {
        forVotes: '0',
        againstVotes: '0',
      },
    };
  });

  return {
    proposals: proposalsWithVotes,
  };
}

export const useProposals = (totalCount: number) => {
  const { votingMachineSerivce } = useSharedDependencies();
  return useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      return fetchProposals(pageParam, votingMachineSerivce);
    },
    queryKey: ['proposals'],
    enabled: totalCount > 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.proposals.length < PAGE_SIZE) {
        return undefined;
      }

      return allPages.length;
    },
  });
};

export const useGetProposalCount = () => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getProposalCount(),
    queryKey: ['proposalCount'],
    enabled: true,
    initialData: 0,
    // staleTime: Infinity, ????
  });
};

export const useGetProposalsData = ({
  fromId,
  toId,
  limit,
  enabled,
}: {
  fromId: number;
  toId: number;
  limit: number;
  enabled: boolean;
}) => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getProposalsData(fromId, toId, limit),
    queryKey: ['proposalsData', fromId, toId],
    enabled: enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: Infinity, ????
  });
};

// voting configs should rarely be changed, so set cache time to infinity
export const useGetVotingConfig = () => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getVotingConfig(),
    queryKey: ['votingConfig'],
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
};
