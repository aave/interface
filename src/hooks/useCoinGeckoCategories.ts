import { useQuery } from '@tanstack/react-query';

export function useCoingeckoCategories() {
  return useQuery({
    queryFn: async () => {
      const response = await fetch('/api/coingecko-categories');
      if (!response.ok) throw new Error('Failed to fetch CoinGecko categories');
      return await response.json();
    },
    queryKey: ['coingecko-categories'],
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });
}
