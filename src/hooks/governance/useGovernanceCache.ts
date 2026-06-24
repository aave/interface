/**
 * Governance cache hooks — React Query layer over the governance cache SDK
 * (src/services/governance-cache-sdk).
 *
 * These hooks are cache-only. The unified hooks in useGovernanceProposals.ts
 * delegate their cache branch here (gated via the `enabled` option) and keep
 * the graph branch alongside, preserving stable hook call order.
 */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Contract } from 'ethers';
import {
  adaptCacheProposalToDetail,
  adaptCacheProposalToListItem,
  adaptCacheVote,
} from 'src/modules/governance/adapters';
import {
  ProposalDetailDisplay,
  ProposalListItem,
  VoteDisplay,
  VotersSplitDisplay,
} from 'src/modules/governance/types';
import {
  getProposalDetail,
  getProposalPayloads,
  getProposals,
  getProposalVotes,
  getProposalVotingConfig,
  getUserVote,
  ProposalPayload,
  ProposalVote,
  ProposalVotingConfig,
  searchProposals,
} from 'src/services/governance-cache-sdk';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

// ============================================
// Shared constants / helpers
// ============================================

const PROPOSALS_PAGE_SIZE = 10;
const VOTES_PAGE_SIZE = 50;
const SEARCH_RESULTS_LIMIT = 10;

export const ENS_REVERSE_REGISTRAR = '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C';

/** Cache data is event-derived and effectively immutable — avoid noisy refetches. */
const CACHE_QUERY_OPTIONS = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
} as const;

/** Shared infinite-query pagination: stop when a page is short. */
const pagedNextParam =
  <P>(getItems: (page: P) => unknown[], pageSize: number) =>
  (lastPage: P, allPages: P[]): number | undefined =>
    getItems(lastPage).length < pageSize ? undefined : allPages.length;

export interface CacheHookOptions {
  enabled?: boolean;
}

const ensAbi = [
  {
    inputs: [{ internalType: 'address[]', name: 'addresses', type: 'address[]' }],
    name: 'getNames',
    outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
];

/** Reverse-resolve ENS names for a set of voter addresses. Returns a lowercased map. */
const useEnsNames = (proposalId: number, addresses: string[], enabled: boolean) => {
  const { data } = useQuery({
    queryKey: queryKeysFactory.governanceCacheVotersEns(proposalId, addresses),
    queryFn: async () => {
      const provider = getProvider(governanceV3Config.coreChainId);
      const contract = new Contract(ENS_REVERSE_REGISTRAR, ensAbi).connect(provider);
      const names: string[] = await contract.getNames(addresses);
      const map: Record<string, string> = {};
      addresses.forEach((addr, i) => {
        if (names[i]) map[addr.toLowerCase()] = names[i];
      });
      return map;
    },
    enabled: enabled && addresses.length > 0,
    ...CACHE_QUERY_OPTIONS,
  });
  return data ?? {};
};

// ============================================
// Proposals — list / search / detail
// ============================================

/** Paginated proposals list, adapted to the canonical list item type. */
export const useCacheProposalsList = ({ enabled = true }: CacheHookOptions = {}) =>
  useInfiniteQuery({
    queryKey: queryKeysFactory.governanceCacheProposals(),
    queryFn: async ({ pageParam = 0 }) => {
      const proposals = await getProposals(PROPOSALS_PAGE_SIZE, pageParam * PROPOSALS_PAGE_SIZE);
      return { proposals: proposals.map(adaptCacheProposalToListItem) };
    },
    enabled,
    initialPageParam: 0,
    getNextPageParam: pagedNextParam(
      (p: { proposals: ProposalListItem[] }) => p.proposals,
      PROPOSALS_PAGE_SIZE
    ),
    ...CACHE_QUERY_OPTIONS,
  });

/** Full-text proposal search, adapted to canonical list items. */
export const useCacheProposalsSearch = (query: string, { enabled = true }: CacheHookOptions = {}) =>
  useQuery({
    queryKey: queryKeysFactory.governanceCacheSearch(query),
    queryFn: async () => {
      const results = await searchProposals(query, SEARCH_RESULTS_LIMIT);
      return results.map(adaptCacheProposalToListItem);
    },
    enabled: enabled && query.trim() !== '',
    ...CACHE_QUERY_OPTIONS,
  });

/** Full proposal detail + the connected user's vote, adapted to the display type. */
export const useCacheProposalDetail = (
  proposalId: number,
  { enabled = true }: CacheHookOptions = {}
) => {
  const user = useRootStore((store) => store.account);
  return useQuery<ProposalDetailDisplay | null>({
    queryKey: queryKeysFactory.governanceCacheProposalDetail(proposalId, user),
    queryFn: async () => {
      const detail = await getProposalDetail(String(proposalId));
      if (!detail) return null;
      const userVote = user ? await getUserVote(String(proposalId), user) : null;
      return adaptCacheProposalToDetail(detail, userVote);
    },
    enabled: enabled && !isNaN(proposalId),
    ...CACHE_QUERY_OPTIONS,
  });
};

// ============================================
// Votes
// ============================================

/** Paginated raw votes for a proposal, optionally filtered by support. */
const useCacheProposalVotes = (proposalId: number, support: boolean, enabled: boolean) =>
  useInfiniteQuery({
    queryKey: queryKeysFactory.governanceCacheVotes(proposalId, support),
    queryFn: async ({ pageParam = 0 }) => {
      const votes = await getProposalVotes(
        String(proposalId),
        support,
        VOTES_PAGE_SIZE,
        pageParam * VOTES_PAGE_SIZE
      );
      return { votes };
    },
    enabled: enabled && !isNaN(proposalId),
    initialPageParam: 0,
    getNextPageParam: pagedNextParam((p: { votes: ProposalVote[] }) => p.votes, VOTES_PAGE_SIZE),
    ...CACHE_QUERY_OPTIONS,
  });

/** Voters split into yae / nay / combined, normalized and ENS-resolved. */
export const useCacheVotersSplit = (
  proposalId: number,
  { enabled = true }: CacheHookOptions = {}
): VotersSplitDisplay & { isFetching: boolean } => {
  const forQuery = useCacheProposalVotes(proposalId, true, enabled);
  const againstQuery = useCacheProposalVotes(proposalId, false, enabled);

  const addresses = [
    ...(forQuery.data?.pages.flatMap((p) => p.votes.map((v) => v.voter)) ?? []),
    ...(againstQuery.data?.pages.flatMap((p) => p.votes.map((v) => v.voter)) ?? []),
  ];
  const ensNames = useEnsNames(proposalId, addresses, enabled);

  const withEns = (vote: VoteDisplay): VoteDisplay => ({
    ...vote,
    ensName: ensNames[vote.voter.toLowerCase()],
  });

  const yaeVotes = (forQuery.data?.pages.flatMap((p) => p.votes.map(adaptCacheVote)) ?? []).map(
    withEns
  );
  const nayVotes = (againstQuery.data?.pages.flatMap((p) => p.votes.map(adaptCacheVote)) ?? []).map(
    withEns
  );
  const combinedVotes = [...yaeVotes, ...nayVotes].sort(
    (a, b) => parseFloat(b.votingPower) - parseFloat(a.votingPower)
  );

  return {
    yaeVotes,
    nayVotes,
    combinedVotes,
    isFetching: forQuery.isFetching || againstQuery.isFetching,
  };
};

// ============================================
// Payloads
// ============================================

/** Payloads for a proposal across chains (raw SDK type). */
export const useCacheProposalPayloads = (
  proposalId: number,
  { enabled = true }: CacheHookOptions = {}
) =>
  useQuery<ProposalPayload[]>({
    queryKey: queryKeysFactory.governanceCachePayloads(proposalId),
    queryFn: () => getProposalPayloads(String(proposalId)),
    enabled: enabled && !isNaN(proposalId),
    ...CACHE_QUERY_OPTIONS,
  });

// ============================================
// Voting config (gap closer)
// ============================================

/**
 * Latest voting config for an access level — exposes `minPropositionPower` and
 * thresholds the curated proposal views omit. The access level comes from a
 * proposal's detail (`accessLevel`). Sourced from the auto-generated
 * VotingConfigUpdated table via the SDK.
 */
export const useProposalVotingConfig = (
  accessLevel: number | undefined,
  { enabled = true }: CacheHookOptions = {}
) =>
  useQuery<ProposalVotingConfig | null>({
    queryKey: queryKeysFactory.governanceCacheVotingConfig(accessLevel ?? -1),
    queryFn: () => getProposalVotingConfig(accessLevel as number),
    enabled: enabled && accessLevel !== undefined,
    ...CACHE_QUERY_OPTIONS,
  });
