import { ChainId } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, Contract } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const usePreviewStake = (
  formattedAmount: string,
  decimals: number,
  chainId: ChainId,
  stakeTokenAddress: string
) => {
  return useQuery({
    queryFn: async () => {
      const provider = getProvider(chainId);
      const amount = parseUnits(formattedAmount || '0', decimals);
      const contract = new Contract(
        stakeTokenAddress,
        ['function previewDeposit(uint256 assets) external view returns (uint256 shares)'],
        provider
      );

      const shares: BigNumber = await contract.previewDeposit(amount);

      return formatUnits(shares, decimals);
    },
    queryKey: ['umbrella', 'previewStake', formattedAmount, stakeTokenAddress],
    enabled: !!formattedAmount,
  });
};
