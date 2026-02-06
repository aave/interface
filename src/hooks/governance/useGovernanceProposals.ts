import { ChainId } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { constants, Contract } from 'ethers';
import { gql } from 'graphql-request';
import {
  adaptCacheProposalToDetail,
  adaptCacheProposalToListItem,
  adaptCacheVote,
  adaptGraphProposalToDetail,
  adaptGraphProposalToListItem,
} from 'src/modules/governance/adapters';
import { lifecycleToBadge } from 'src/modules/governance/StateBadge';
import { ProposalListItem, VoteDisplay, VotersSplitDisplay } from 'src/modules/governance/types';
import {
  getLifecycleState,
  getProposalVoteInfo,
} from 'src/modules/governance/utils/formatProposal';
import {
  getProposalDetailFromCache,
  getProposalsFromCache,
  getProposalVotesFromCache,
  getUserVoteFromCache,
  searchProposalsFromCache,
} from 'src/services/GovernanceCacheService';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { subgraphRequest } from 'src/utils/subgraphRequest';

import { getProposal } from './useProposal';
import {
  fetchProposals,
  fetchSubgraphProposalsByIds,
  getProposals,
  getSubgraphProposalMetadata,
} from './useProposals';

const USE_GOVERNANCE_CACHE = process.env.NEXT_PUBLIC_USE_GOVERNANCE_CACHE === 'true';

const PAGE_SIZE = 10;
const VOTES_PAGE_SIZE = 50;
const SEARCH_RESULTS_LIMIT = 10;
export const ENS_REVERSE_REGISTRAR = '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C';

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
// ============================================

/**
 * Unified proposals list hook. Internally switches between graph and cache.
 * Both queries exist (React hook rules) but only one is enabled at runtime.
 */
export const useGovernanceProposals = () => {
  const { votingMachineSerivce, governanceV3Service } = useSharedDependencies();

  const cacheResult = useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const proposals = await getProposalsFromCache(PAGE_SIZE, pageParam * PAGE_SIZE);
      return { proposals: proposals.map(adaptCacheProposalToListItem) };
    },
    queryKey: ['governance-proposals-cache'],
    enabled: USE_GOVERNANCE_CACHE,
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.proposals.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

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

  const { data: cacheData, isFetching: cacheFetching } = useQuery({
    queryFn: async () => {
      const results = await searchProposalsFromCache(query, SEARCH_RESULTS_LIMIT);
      return results.map(adaptCacheProposalToListItem);
    },
    enabled: USE_GOVERNANCE_CACHE && query.trim() !== '',
    queryKey: ['governance-search-cache', query],
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

  const cacheResult = useQuery({
    queryFn: async () => {
      const detail = await getProposalDetailFromCache(String(proposalId));
      if (!detail) return null;

      const userVote = user ? await getUserVoteFromCache(String(proposalId), user) : null;

      return adaptCacheProposalToDetail(detail, userVote);
    },
    queryKey: ['governance-detail-cache', proposalId, user],
    enabled: USE_GOVERNANCE_CACHE && !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

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
  // Cache path - for votes
  const { data: cacheForData, isFetching: cacheFetchingFor } = useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const votes = await getProposalVotesFromCache(
        String(proposalId),
        true,
        VOTES_PAGE_SIZE,
        pageParam * VOTES_PAGE_SIZE
      );
      return { votes };
    },
    queryKey: ['governance-voters-cache-for', proposalId],
    enabled: USE_GOVERNANCE_CACHE && !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.votes.length < VOTES_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  // Cache path - against votes
  const { data: cacheAgainstData, isFetching: cacheFetchingAgainst } = useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const votes = await getProposalVotesFromCache(
        String(proposalId),
        false,
        VOTES_PAGE_SIZE,
        pageParam * VOTES_PAGE_SIZE
      );
      return { votes };
    },
    queryKey: ['governance-voters-cache-against', proposalId],
    enabled: USE_GOVERNANCE_CACHE && !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.votes.length < VOTES_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  // Graph path
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

  // ENS resolution for cache path voters
  const cacheVoterAddresses = USE_GOVERNANCE_CACHE
    ? [
        ...(cacheForData?.pages.flatMap((p) => p.votes.map((v) => v.voter)) || []),
        ...(cacheAgainstData?.pages.flatMap((p) => p.votes.map((v) => v.voter)) || []),
      ]
    : [];

  const { data: cacheEnsNames } = useQuery({
    queryFn: async () => {
      const provider = getProvider(governanceV3Config.coreChainId);
      const contract = new Contract(ENS_REVERSE_REGISTRAR, ensAbi);
      const connectedContract = contract.connect(provider);
      const names: string[] = await connectedContract.getNames(cacheVoterAddresses);
      const map: Record<string, string> = {};
      cacheVoterAddresses.forEach((addr, i) => {
        if (names[i]) map[addr.toLowerCase()] = names[i];
      });
      return map;
    },
    queryKey: ['governance-voters-ens', proposalId, cacheVoterAddresses.length],
    enabled: USE_GOVERNANCE_CACHE && cacheVoterAddresses.length > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (USE_GOVERNANCE_CACHE) {
    const withEns = (vote: VoteDisplay): VoteDisplay => ({
      ...vote,
      ensName: cacheEnsNames?.[vote.voter.toLowerCase()],
    });
    const yaeVotes = (cacheForData?.pages.flatMap((p) => p.votes.map(adaptCacheVote)) || []).map(
      withEns
    );
    const nayVotes = (
      cacheAgainstData?.pages.flatMap((p) => p.votes.map(adaptCacheVote)) || []
    ).map(withEns);
    const combinedVotes = [...yaeVotes, ...nayVotes].sort(
      (a, b) => parseFloat(b.votingPower) - parseFloat(a.votingPower)
    );
    return {
      yaeVotes,
      nayVotes,
      combinedVotes,
      isFetching: cacheFetchingFor || cacheFetchingAgainst,
    };
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
