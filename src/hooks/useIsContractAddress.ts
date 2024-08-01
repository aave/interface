import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const useIsContractAddress = (address: string, chainId?: number) => {
  const defaultChainId = useRootStore((store) => store.currentChainId);
  const provider = getProvider(chainId ?? defaultChainId);

  return useQuery({
    queryFn: () => provider.getCode(address),
    queryKey: ['isContractAddress', address],
    enabled: true,
    staleTime: Infinity,
    select: (data) => data !== '0x',
  });
};
