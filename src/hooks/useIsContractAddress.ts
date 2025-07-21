import { useQuery } from '@tanstack/react-query';
import { isCodeSafeWallet } from 'src/helpers/provider';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const useIsContractAddress = (address: string, chainId?: number) => {
  const defaultChainId = useRootStore((store) => store.currentChainId);
  const provider = getProvider(chainId ?? defaultChainId);

  return useQuery({
    queryFn: () => provider.getCode(address),
    queryKey: ['isContractAddress', address],
    enabled: address !== '',
    staleTime: Infinity,
    select: (data) => {
      const isContract = data !== '0x';
      const isSafeWallet = isCodeSafeWallet(data);
      return { isContract, isSafeWallet };
    },
  });
};
