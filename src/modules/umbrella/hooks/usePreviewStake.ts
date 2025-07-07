import { ChainId } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const usePreviewStake = (
  amount: string,
  decimals: number,
  stataTokenAddress: string,
  chainId: ChainId
) => {
  return useQuery({
    queryFn: async () => {
      if (!stataTokenAddress) {
        return formatUnits(amount, decimals);
      }

      const provider = getProvider(chainId);
      const contract = new Contract(
        stataTokenAddress,
        ['function previewDeposit(uint256 assets) external view returns (uint256 shares)'],
        provider
      );
      const shares: BigNumber = await contract.previewDeposit(amount);
      return formatUnits(shares, decimals);
    },
    queryKey: ['umbrella', 'previewStake', amount, stataTokenAddress],
    enabled: !!amount,
  });
};
