import { ChainId } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { constants, Contract } from 'ethers';
import { gql } from 'graphql-request';
import {
  adaptGraphProposalToDetail,
  adaptGraphProposalToListItem,
} from 'src/modules/governance/adapters';
import { lifecycleToBadge } from 'src/modules/governance/StateBadge';
import { ProposalListItem, VoteDisplay, VotersSplitDisplay } from 'src/modules/governance/types';
import {
  getLifecycleState,
  getProposalVoteInfo,
} from 'src/modules/governance/utils/formatProposal';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { subgraphRequest } from 'src/utils/subgraphRequest';

import {
  ENS_REVERSE_REGISTRAR,
  useCacheProposalDetail,
  useCacheProposalsList,
  useCacheProposalsSearch,
  useCacheVotersSplit,
} from './useGovernanceCache';
import { getProposal } from './useProposal';
import {
  fetchProposals,
  fetchSubgraphProposalsByIds,
  getProposals,
  getSubgraphProposalMetadata,
} from './useProposals';

const USE_GOVERNANCE_CACHE = process.env.NEXT_PUBLIC_USE_GOVERNANCE_CACHE === 'true';

const PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 10;

// Re-exported for the graph-path voter ENS lookup in useProposalVotes.ts.
export { ENS_REVERSE_REGISTRAR };

// ============================================
// Subgraph search query
// ============================================

const searchProposalsQuery = gql`
  query search($query: String!, $first: Int!) {
    proposalSearch(text: $query, first: $first) {
      proposalId
    }
  }
`;

const searchSubgraphProposals = (query: string) =>
  subgraphRequest<{ proposalSearch: Array<{ proposalId: string }> }>(
    governanceV3Config.governanceCoreSubgraphId,
    searchProposalsQuery,
    { query, first: SEARCH_RESULTS_LIMIT }
  );

// ============================================
// Subgraph vote fetching
// ============================================

const getProposalVotesQuery = gql`
  query getProposalVotes($proposalId: Int!) {
    voteEmitteds(where: { proposalId: $proposalId }) {
      proposalId
      support
      voter
      votingPower
    }
  }
`;

const ensAbi = [
  {
    inputs: [{ internalType: 'address[]', name: 'addresses', type: 'address[]' }],
    name: 'getNames',
    outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
];

type SubgraphVote = {
  proposalId: string;
  support: boolean;
  voter: string;
  votingPower: string;
};

async function fetchSubgraphVotes(proposalId: number, votingChainId: ChainId) {
  const config = governanceV3Config.votingChainConfig[votingChainId as ChainId];
  const data = await subgraphRequest<{ voteEmitteds: SubgraphVote[] }>(
    config.subgraphKey,
    getProposalVotesQuery,
    { proposalId }
  );
  return data.voteEmitteds.map((vote) => ({
    ...vote,
    votingPower: normalizeBN(vote.votingPower, 18).toString(),
  }));
}

// ============================================
// Unified hooks
//
// Both the cache and graph queries are always declared (React requires a
// stable hook call order); the `enabled` flag ensures only one path fires.
// The cache branch delegates to the SDK-backed hooks in useGovernanceCache.ts;
// the graph branch fetches from the subgraph + on-chain contracts.
// ============================================

/**
 * Unified proposals list hook.
 */
export const useGovernanceProposals = () => {
  const { votingMachineSerivce, governanceV3Service } = useSharedDependencies();

  const cacheResult = useCacheProposalsList({ enabled: USE_GOVERNANCE_CACHE });

  const graphResult = useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getProposals(PAGE_SIZE, pageParam * PAGE_SIZE);
      const enriched = await fetchProposals(
        result.proposals,
        votingMachineSerivce,
        governanceV3Service
      );
      return { proposals: enriched.proposals.map(adaptGraphProposalToListItem) };
    },
    queryKey: ['governance-proposals-graph'],
    enabled: !USE_GOVERNANCE_CACHE,
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.proposals.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  return USE_GOVERNANCE_CACHE ? cacheResult : graphResult;
};

/**
 * Unified proposals search hook.
 */
export const useGovernanceProposalsSearch = (query: string) => {
  const { votingMachineSerivce, governanceV3Service } = useSharedDependencies();
  const formattedQuery = query.trim().split(' ').join(' & ');

  const { data: cacheData, isFetching: cacheFetching } = useCacheProposalsSearch(query, {
    enabled: USE_GOVERNANCE_CACHE,
  });

  const { data: graphIds, isFetching: graphIdsFetching } = useQuery({
    queryFn: () => searchSubgraphProposals(formattedQuery),
    enabled: !USE_GOVERNANCE_CACHE && query !== '',
    queryKey: ['governance-search-graph-ids', formattedQuery],
    select: (data) => data.proposalSearch.map((prop) => prop.proposalId),
  });

  const { data: graphData, isFetching: graphProposalsFetching } = useQuery({
    queryFn: async () => {
      const proposals = await fetchSubgraphProposalsByIds(graphIds || []);
      const enriched = await fetchProposals(proposals, votingMachineSerivce, governanceV3Service);
      return enriched.proposals.map(adaptGraphProposalToListItem);
    },
    queryKey: ['governance-search-graph-proposals', graphIds],
    enabled: !USE_GOVERNANCE_CACHE && graphIds !== undefined && graphIds.length > 0,
  });

  if (USE_GOVERNANCE_CACHE) {
    return {
      results: (cacheData || []) as ProposalListItem[],
      loading: cacheFetching,
    };
  }

  return {
    results: (graphData || []) as ProposalListItem[],
    loading: graphIdsFetching || graphProposalsFetching,
  };
};

/**
 * Unified proposal detail hook.
 */
export const useGovernanceProposalDetail = (proposalId: number) => {
  const { votingMachineSerivce, governanceV3Service } = useSharedDependencies();
  const user = useRootStore((store) => store.account);

  const cacheResult = useCacheProposalDetail(proposalId, { enabled: USE_GOVERNANCE_CACHE });

  const graphResult = useQuery({
    queryFn: async () => {
      const proposal = await getProposal(proposalId);
      const votingMachineParams = {
        id: +proposal.id,
        snapshotBlockHash: proposal.snapshotBlockHash || constants.HashZero,
        chainId: +proposal.votingPortal.votingMachineChainId,
        votingMachineAddress: proposal.votingPortal.votingMachine,
      };
      const payloadParams = proposal.payloads.map((p) => ({
        payloadControllerAddress: p.payloadsController,
        payloadId: +p.id.split('_')[1],
        chainId: +p.chainId,
      }));

      const [proposalMetadata, votingMachineData, payloadsData] = await Promise.all([
        getSubgraphProposalMetadata(proposal),
        votingMachineSerivce.getProposalsData([votingMachineParams], user).then((data) => data[0]),
        governanceV3Service.getMultiChainPayloadsData(payloadParams),
      ]);

      const enhancedSubgraphProposal = {
        ...proposal,
        votes: {
          forVotes: votingMachineData.proposalData.forVotes,
          againstVotes: votingMachineData.proposalData.againstVotes,
        },
        proposalMetadata,
      };

      const lifecycleState = getLifecycleState(proposal, votingMachineData, payloadsData);
      const votingInfo = getProposalVoteInfo(enhancedSubgraphProposal);
      const badgeState = lifecycleToBadge(lifecycleState, votingInfo);

      return adaptGraphProposalToDetail({
        subgraphProposal: enhancedSubgraphProposal,
        votingMachineData,
        payloadsData,
        lifecycleState,
        badgeState,
        votingInfo,
      });
    },
    queryKey: ['governance-detail-graph', proposalId, user],
    enabled: !USE_GOVERNANCE_CACHE && !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return USE_GOVERNANCE_CACHE ? cacheResult : graphResult;
};

/**
 * Unified voters split hook.
 */
export const useGovernanceVotersSplit = (
  proposalId: number,
  votingChainId?: number
): VotersSplitDisplay & { isFetching: boolean } => {
  const cacheSplit = useCacheVotersSplit(proposalId, { enabled: USE_GOVERNANCE_CACHE });

  const { data: graphVotes, isFetching: graphFetching } = useQuery({
    queryFn: async () => {
      const votes = await fetchSubgraphVotes(proposalId, votingChainId as ChainId);
      try {
        const provider = getProvider(governanceV3Config.coreChainId);
        const contract = new Contract(ENS_REVERSE_REGISTRAR, ensAbi);
        const connectedContract = contract.connect(provider);
        const ensNames: string[] = await connectedContract.getNames(votes.map((v) => v.voter));
        return votes.map((vote, i) => ({
          ...vote,
          ensName: ensNames[i] || undefined,
        }));
      } catch {
        return votes;
      }
    },
    queryKey: ['governance-voters-graph', proposalId],
    enabled: !USE_GOVERNANCE_CACHE && votingChainId !== undefined && !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (USE_GOVERNANCE_CACHE) {
    return cacheSplit;
  }

  const sortByPower = (a: { votingPower: string }, b: { votingPower: string }) =>
    +a.votingPower < +b.votingPower ? 1 : +a.votingPower > +b.votingPower ? -1 : 0;

  const toVoteDisplay = (v: {
    voter: string;
    support: boolean;
    votingPower: string;
    ensName?: string;
  }): VoteDisplay => ({
    voter: v.voter,
    support: v.support,
    votingPower: v.votingPower,
    ensName: v.ensName,
  });

  const yaeVotes =
    graphVotes
      ?.filter((v) => v.support)
      .sort(sortByPower)
      .map(toVoteDisplay) || [];
  const nayVotes =
    graphVotes
      ?.filter((v) => !v.support)
      .sort(sortByPower)
      .map(toVoteDisplay) || [];
  const combinedVotes = graphVotes ? [...graphVotes].sort(sortByPower).map(toVoteDisplay) : [];

  return { yaeVotes, nayVotes, combinedVotes, isFetching: graphFetching };
};
