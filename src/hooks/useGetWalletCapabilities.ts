import { useQuery } from '@tanstack/react-query';
import { useAccount, useWalletClient } from 'wagmi';

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
      const simplifiedCapabilities: WalletCapabilities = {};
      Object.entries(capabilities).forEach(([chainId, chainCapabilities]) => {
        const atomicStatus = (chainCapabilities as { atomic?: { status?: string } })?.atomic
          ?.status;
        simplifiedCapabilities[Number(chainId)] =
          atomicStatus === 'supported' || atomicStatus === 'ready';
      });
      return simplifiedCapabilities;
    },
    queryKey: ['walletCapabilities', address],
    enabled: !!walletClient && !!address,
  });
};
