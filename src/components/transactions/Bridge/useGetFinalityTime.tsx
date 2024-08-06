import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

dayjs.extend(relativeTime);

// Used in case there's an error fetching the latest finalized block, it should give a close estimate for Arb or Eth source chains
const DEFAULT_FINALITY_TIME = 1080; // 18 minutes

export const useTimeToDestination = (sourceChainId: number) => {
  return useQuery({
    queryFn: async () => {
      const provider = getProvider(sourceChainId);
      try {
        const block = await provider.send('eth_getBlockByNumber', ['finalized', false]);
        const timestamp = parseInt(block.timestamp, 16);
        const now = dayjs().unix();
        const estimatedTimeToDestination = dayjs.unix(now + (now - timestamp) + 120).fromNow();
        return estimatedTimeToDestination;
      } catch (error) {
        console.error('Error fetching finality time', error);
        return dayjs.unix(dayjs().unix() + DEFAULT_FINALITY_TIME).fromNow();
      }
    },
    queryKey: ['getFinalityTime', sourceChainId],
    cacheTime: 0,
    staleTime: 0,
  });
};
