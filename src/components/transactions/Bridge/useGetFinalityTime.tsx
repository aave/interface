import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const useTimeToDestination = (sourceChainId: number) => {
  return useQuery({
    queryFn: async () => {
      const provider = getProvider(sourceChainId);
      try {
        const block = await provider.send('eth_getBlockByNumber', ['finalized', false]);
        const timestamp = parseInt(block.timestamp, 16);
        const now = dayjs().unix();
        console.log('timestamp', timestamp);
        const estimatedTimeToDestination = dayjs.unix(now + (now - timestamp) + 120).fromNow();
        return estimatedTimeToDestination;
      } catch (error) {
        console.error('Error fetching finality time', error);
        return 'TODO'; // need to add some reasonable defaults as a fallback
      }
    },
    queryKey: ['getFinalityTime', sourceChainId],
    cacheTime: 0,
    staleTime: 0,
  });
};
