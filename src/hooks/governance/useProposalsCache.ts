import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getProposalsFromCache,
  searchProposalsFromCache,
  SimplifiedProposal,
} from 'src/services/GovernanceCacheService';

const PAGE_SIZE = 10;

/**
 * Hook to fetch proposals from the local governance cache
 * This is a simplified version that doesn't require on-chain calls
 */
export const useProposalsCache = (stateFilter?: string) => {
  return useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const proposals = await getProposalsFromCache(PAGE_SIZE, pageParam * PAGE_SIZE, stateFilter);
      return { proposals };
    },
    queryKey: ['proposals-cache', stateFilter],
    refetchOnMount: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.proposals.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });
};

/**
 * Hook to search proposals from the local governance cache
 */
export const useProposalsSearchCache = (query: string) => {
  const { data, isFetching } = useQuery({
    queryFn: () => searchProposalsFromCache(query, 10),
    enabled: query.trim() !== '',
    queryKey: ['proposals-search-cache', query],
  });

  return {
    results: data || [],
    loading: isFetching,
  };
};

/**
 * Map state string to badge state for UI
 */
export function getStateBadge(state: string): string {
  switch (state) {
    case 'created':
      return 'Created';
    case 'active':
      return 'Active';
    case 'queued':
      return 'Queued';
    case 'executed':
      return 'Executed';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return state;
  }
}

/**
 * Get badge color for state
 */
export function getStateBadgeColor(state: string): 'success' | 'error' | 'warning' | 'info' {
  switch (state) {
    case 'executed':
      return 'success';
    case 'failed':
    case 'cancelled':
      return 'error';
    case 'active':
    case 'queued':
      return 'warning';
    default:
      return 'info';
  }
}

export type { SimplifiedProposal };
