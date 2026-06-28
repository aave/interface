import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const useIsContractAddress = (address: string, chainId?: number) => {
  const defaultChainId = useRootStore((store) => store.currentChainId);

  return useQuery({
    queryFn: async () => {
      try {
        const provider = getProvider(chainId ?? defaultChainId);
        return await provider.getCode(address);
      } catch (error) {
        console.error('Error getting code:', error);
        return '0x';
      }
    },
    queryKey: ['isContractAddress', address, chainId ?? defaultChainId],
    enabled: address !== '',
    staleTime: Infinity,
    select: (data) => data !== '0x',
  });
};
