import { ChainId } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const usePreviewRedeem = (
  amount: string,
  decimals: number,
  waTokenAddress: string,
  chainId: ChainId
) => {
  return useQuery({
    queryFn: async () => {
      if (!waTokenAddress) {
        return formatUnits(amount, decimals);
      }

      const provider = getProvider(chainId);
      const waTokenContract = new Contract(
        waTokenAddress,
        ['function previewRedeem(uint256 shares) external view returns (uint256 assets)'],
        provider
      );
      const shares: BigNumber = await waTokenContract.previewRedeem(amount);
      return formatUnits(shares, decimals);
    },
    queryKey: ['umbrella', 'previewRedeem', amount, waTokenAddress],
  });
};
