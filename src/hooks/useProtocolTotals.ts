import { useQuery } from '@tanstack/react-query';
import type { ProtocolTotals } from 'pages/api/ProtocolTotalsService';

export type { ProtocolBreakdownEntry, ProtocolTotals } from 'pages/api/ProtocolTotalsService';

/**
 * Whole-protocol deposit and loan totals across every Aave version and chain.
 * Errors when the reading is unavailable so callers render nothing rather than zeros.
 */
export const useProtocolTotals = () => {
  return useQuery<ProtocolTotals>({
    queryKey: ['protocol-totals'],
    queryFn: async () => {
      const response = await fetch('/api/protocol-totals');
      if (!response.ok) throw new Error(`Protocol totals unavailable (${response.status})`);
      return (await response.json()) as ProtocolTotals;
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
