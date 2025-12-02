import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const useIsContractAddress = (address: string, chainId?: number) => {
  const defaultChainId = useRootStore((store) => store.currentChainId);

  return useQuery({
    queryFn: () => {
      try {
        const provider = getProvider(chainId ?? defaultChainId);
        return provider.getCode(address);
      } catch (error) {
        console.error('Error getting code:', error);
        return '0x';
      }
    },
    queryKey: ['isContractAddress', address],
    enabled: address !== '',
    staleTime: Infinity,
    select: (data) => data !== '0x',
  });
};
