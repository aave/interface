import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getProposalDetailFromCache,
  getProposalPayloadsFromCache,
  getProposalVoteCountsFromCache,
  getProposalVotesFromCache,
  ProposalDetail,
  ProposalPayload,
  ProposalVote,
} from 'src/services/GovernanceCacheService';

const VOTES_PAGE_SIZE = 50;

/**
 * Hook to fetch full proposal details from the cache
 * Includes timestamps and voting timing
 */
export const useProposalDetailCache = (proposalId: number) => {
  return useQuery({
    queryFn: () => getProposalDetailFromCache(String(proposalId)),
    queryKey: ['proposal-detail-cache', proposalId],
    enabled: !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook to fetch votes for a proposal from the cache
 * Supports filtering by support (for/against) and pagination
 */
export const useProposalVotesCache = (proposalId: number, support?: boolean) => {
  return useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const votes = await getProposalVotesFromCache(
        String(proposalId),
        support,
        VOTES_PAGE_SIZE,
        pageParam * VOTES_PAGE_SIZE
      );
      return { votes };
    },
    queryKey: ['proposal-votes-cache', proposalId, support],
    enabled: !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.votes.length < VOTES_PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });
};

/**
 * Hook to get vote counts from the cache
 */
export const useProposalVoteCountsCache = (proposalId: number) => {
  return useQuery({
    queryFn: () => getProposalVoteCountsFromCache(String(proposalId)),
    queryKey: ['proposal-vote-counts-cache', proposalId],
    enabled: !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Combined hook that returns votes split by support
 * Similar to useProposalVotes but from cache
 */
export const useProposalVotesSplitCache = (proposalId: number) => {
  const { data: forData, isFetching: fetchingFor } = useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const votes = await getProposalVotesFromCache(
        String(proposalId),
        true,
        VOTES_PAGE_SIZE,
        pageParam * VOTES_PAGE_SIZE
      );
      return { votes };
    },
    queryKey: ['proposal-votes-cache-for', proposalId],
    enabled: !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.votes.length < VOTES_PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });

  const { data: againstData, isFetching: fetchingAgainst } = useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const votes = await getProposalVotesFromCache(
        String(proposalId),
        false,
        VOTES_PAGE_SIZE,
        pageParam * VOTES_PAGE_SIZE
      );
      return { votes };
    },
    queryKey: ['proposal-votes-cache-against', proposalId],
    enabled: !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.votes.length < VOTES_PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });

  // Flatten pages
  const yaeVotes: ProposalVote[] = [];
  const nayVotes: ProposalVote[] = [];

  forData?.pages.forEach((page) => yaeVotes.push(...page.votes));
  againstData?.pages.forEach((page) => nayVotes.push(...page.votes));

  return {
    yaeVotes,
    nayVotes,
    combinedVotes: [...yaeVotes, ...nayVotes].sort(
      (a, b) => parseFloat(b.votingPower) - parseFloat(a.votingPower)
    ),
    isFetching: fetchingFor || fetchingAgainst,
  };
};

/**
 * Helper to format vote power (18 decimals)
 */
export function formatVotePower(votingPower: string): number {
  const raw = parseFloat(votingPower) || 0;
  return raw / 1e18;
}

/**
 * Helper to get time remaining for voting
 */
export function getVotingTimeRemaining(endTime: string | null): {
  isEnded: boolean;
  remainingSeconds: number;
  remainingFormatted: string;
} {
  if (!endTime) {
    return { isEnded: true, remainingSeconds: 0, remainingFormatted: 'N/A' };
  }

  const endTimestamp = parseInt(endTime, 10);
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTimestamp - now;

  if (remaining <= 0) {
    return { isEnded: true, remainingSeconds: 0, remainingFormatted: 'Ended' };
  }

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  if (hours > 0 || days > 0) formatted += `${hours}h `;
  formatted += `${minutes}m`;

  return {
    isEnded: false,
    remainingSeconds: remaining,
    remainingFormatted: formatted.trim(),
  };
}

/**
 * Hook to fetch payloads for a proposal
 */
export const useProposalPayloadsCache = (proposalId: number) => {
  return useQuery({
    queryFn: () => getProposalPayloadsFromCache(String(proposalId)),
    queryKey: ['proposal-payloads-cache', proposalId],
    enabled: !isNaN(proposalId),
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export type { ProposalDetail, ProposalPayload, ProposalVote };
