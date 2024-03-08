import { ProposalMetadata, ProposalV3State, VotingMachineProposal } from '@aave/contract-helpers';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { constants } from 'ethers';
import request, { gql } from 'graphql-request';
import { lifecycleToBadge, ProposalBadgeState } from 'src/modules/governance/StateBadge';
import {
  getLifecycleState,
  getProposalVoteInfo,
  ProposalLifecycleStep,
  ProposalVoteInfo,
} from 'src/modules/governance/utils/formatProposal';
import {
  getProposalMetadata,
  parseRawIpfs,
} from 'src/modules/governance/utils/getProposalMetadata';
import { EnhancedPayload, GovernanceV3Service } from 'src/services/GovernanceV3Service';
import { VotingMachineService } from 'src/services/VotingMachineService';
import { governanceV3Config, ipfsGateway } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import invariant from 'tiny-invariant';

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
  snapshotBlockHash: string;
  votes: SubgraphProposalVotes | null;
  constants: SubgraphConstants;
}

export interface EnhancedSubgraphProposal
  extends Omit<SubgraphProposal, 'proposalMetadata' | 'votes'> {
  proposalMetadata: ProposalMetadata;
  votes: {
    forVotes: string;
    againstVotes: string;
  };
}

export interface Proposal {
  subgraphProposal: EnhancedSubgraphProposal;
  votingMachineData: VotingMachineProposal;
  payloadsData: EnhancedPayload[];
  lifecycleState: ProposalLifecycleStep;
  badgeState: ProposalBadgeState;
  votingInfo: ProposalVoteInfo;
}

export const proposalQueryFields = `
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
`;

const getProposalsByIdQuery = gql`
  query getProposalsById($ids: [String!]!) {
    proposals(where: { id_in: $ids }) {
      ${proposalQueryFields}
    }
  }
`;

const getProposalsByStateQuery = gql`
  query getProposals($first: Int!, $skip: Int!, $stateFilter: Int!) {
    proposals(orderBy: proposalId, orderDirection: desc, first: $first, skip: $skip, where: { state: $stateFilter }) {
      ${proposalQueryFields}
    }
  }
`;

const getProposalsQuery = gql`
  query getProposals($first: Int!, $skip: Int!, $stateFilter: Int) {
    proposals(orderBy: proposalId, orderDirection: desc, first: $first, skip: $skip) {
      ${proposalQueryFields}
    }
  }
`;

export const getSubgraphProposalMetadata = async (proposal: SubgraphProposal) => {
  if (!proposal.proposalMetadata) {
    return getProposalMetadata(proposal.ipfsHash, ipfsGateway);
  } else {
    return parseRawIpfs(proposal.proposalMetadata.rawContent, proposal.ipfsHash);
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

export const getProposalsByState = (first: number, skip: number, stateFilter: ProposalV3State) =>
  request<{ proposals: SubgraphProposal[] }>(
    governanceV3Config.governanceCoreSubgraphUrl,
    getProposalsByStateQuery,
    {
      first,
      skip,
      stateFilter,
    }
  );

export const getProposalsByIds = (ids: string[]) =>
  request<{ proposals: SubgraphProposal[] }>(
    governanceV3Config.governanceCoreSubgraphUrl,
    getProposalsByIdQuery,
    {
      ids,
    }
  );

const PAGE_SIZE = 10;

export async function fetchSubgraphProposalsByIds(ids: string[]) {
  const result = await getProposalsByIds(ids);
  return result.proposals;
}

async function fetchSubgraphProposals(pageParam: number, proposalStateFilter?: ProposalV3State) {
  if (proposalStateFilter) {
    const result = await getProposalsByState(PAGE_SIZE, pageParam * PAGE_SIZE, proposalStateFilter);
    return result.proposals;
  }

  const result = await getProposals(PAGE_SIZE, pageParam * PAGE_SIZE);
  return result.proposals;
}

export async function fetchProposals(
  proposals: SubgraphProposal[],
  votingMachineSerivce: VotingMachineService,
  governanceV3Service: GovernanceV3Service
) {
  const votingMachineParams =
    proposals.map((p) => ({
      id: +p.id,
      snapshotBlockHash: p.snapshotBlockHash || constants.HashZero,
      chainId: +p.votingPortal.votingMachineChainId,
      votingMachineAddress: p.votingPortal.votingMachine,
    })) ?? [];

  const payloadParams = proposals
    .map(
      (proposal) =>
        proposal.payloads.map((p) => {
          return {
            payloadControllerAddress: p.payloadsController,
            payloadId: +p.id.split('_')[1],
            chainId: +p.chainId,
          };
        }) || []
    )
    .flat();

  const [proposalsMetadata, votingMachineDataes, payloadsDataes] = await Promise.all([
    Promise.all(proposals.map(getSubgraphProposalMetadata)),
    votingMachineSerivce.getProposalsData(votingMachineParams),
    governanceV3Service.getMultiChainPayloadsData(payloadParams),
  ]);
  const enhancedProposals = proposals.map<Proposal>((proposal, index) => {
    const votingMachineData = votingMachineDataes.find(
      (proposalData) => proposalData.proposalData.id === proposal.id
    );
    const payloadsData = payloadsDataes.filter((payloadData) =>
      proposal.payloads.find(
        (p) => p.id.split('_')[1] === payloadData.id && +p.chainId === payloadData.chainId
      )
    );
    invariant(votingMachineData, 'Voting machine data not found');
    const lifecycleState = getLifecycleState(proposal, votingMachineData, payloadsData);
    const enhancedSubgraphProposal = {
      ...proposal,
      votes: {
        forVotes: votingMachineData.proposalData.forVotes,
        againstVotes: votingMachineData.proposalData.againstVotes,
      },
      proposalMetadata: proposalsMetadata[index],
    };
    const votingInfo = getProposalVoteInfo(enhancedSubgraphProposal);
    const badgeState = lifecycleToBadge(lifecycleState, votingInfo);
    return {
      subgraphProposal: enhancedSubgraphProposal,
      lifecycleState,
      badgeState,
      votingMachineData,
      payloadsData,
      votingInfo,
    };
  });

  return {
    proposals: enhancedProposals,
  };
}

export const useProposals = (proposalStateFilter?: ProposalV3State) => {
  const { votingMachineSerivce, governanceV3Service } = useSharedDependencies();
  return useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      let proposals: SubgraphProposal[] = [];
      if (proposalStateFilter) {
        proposals = await fetchSubgraphProposals(pageParam, proposalStateFilter);
      } else {
        proposals = await fetchSubgraphProposals(pageParam);
      }

      return fetchProposals(proposals, votingMachineSerivce, governanceV3Service);
    },
    queryKey: ['proposals', proposalStateFilter],
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
