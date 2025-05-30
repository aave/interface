import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useWalletClient } from 'wagmi';

export type WalletCapabilities = {
  [chainId: number]: boolean;
};

export const useGetWalletCapabilities = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  return useQuery({
    queryFn: async () => {
      if (!walletClient || !address) return null;
      
      const capabilities = await walletClient.getCapabilities();
      
      // Transform capabilities into a simple boolean map
      const simplifiedCapabilities: WalletCapabilities = {};
      Object.entries(capabilities).forEach(([chainId, chainCapabilities]) => {
        const atomicStatus = (chainCapabilities as any)?.atomic?.status;
        simplifiedCapabilities[Number(chainId)] = atomicStatus === 'supported' || atomicStatus === 'ready';
      });
      
      return simplifiedCapabilities;
    },
    queryKey: ['walletCapabilities', address],
    enabled: !!walletClient && !!address,
  });
}; 