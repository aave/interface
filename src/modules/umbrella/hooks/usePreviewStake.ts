import { ChainId } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, Contract } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export const usePreviewStake = (
  formattedAmount: string,
  decimals: number,
  chainId: ChainId,
  stakeTokenAddress: string,
  stakeTokenGateway?: string
) => {
  return useQuery({
    queryFn: async () => {
      const provider = getProvider(chainId);
      let shares: BigNumber;
      const amount = parseUnits(formattedAmount || '0', decimals);
      if (!stakeTokenGateway) {
        const contract = new Contract(
          stakeTokenAddress,
          ['function previewDeposit(uint256 assets) external view returns (uint256 shares)'],
          provider
        );
        shares = await contract.previewDeposit(amount);
      } else {
        const contract = new Contract(
          stakeTokenGateway,
          [
            'function previewStake(address stakeToken, uint256 amount) public view returns (uint256 shares)',
          ],
          provider
        );
        shares = await contract.previewStake(stakeTokenAddress, amount);
      }
      return formatUnits(shares, decimals);
    },
    queryKey: ['umbrella', 'previewStake', formattedAmount, stakeTokenAddress],
    enabled: !!formattedAmount,
  });
};
