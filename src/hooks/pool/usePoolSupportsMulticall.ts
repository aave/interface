import { useQuery } from '@tanstack/react-query';
import { Contract } from 'ethers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

/**
 * Pool.multicall was introduced in Aave v3.4, which bumped POOL_REVISION to 8.
 * Pools below that revision revert on the call, so the flows that bundle pool
 * actions are hidden entirely on those markets.
 */
export const MULTICALL_POOL_REVISION = 8;

const POOL_REVISION_ABI = ['function POOL_REVISION() view returns (uint256)'];

export const usePoolSupportsMulticall = (marketData: MarketDataType) => {
  const poolAddress = marketData.addresses.LENDING_POOL;
  const chainId = marketData.chainId;

  return useQuery({
    queryFn: async () => {
      try {
        const provider = getProvider(chainId);
        const revision = await new Contract(
          poolAddress,
          POOL_REVISION_ABI,
          provider
        ).POOL_REVISION();
        return revision.gte(MULTICALL_POOL_REVISION);
      } catch (error) {
        // Pools that predate the getter, and any RPC failure, report no
        // support — the bundled flows stay hidden rather than sending a tx
        // that would revert.
        console.error('Error reading POOL_REVISION:', error);
        return false;
      }
    },
    queryKey: ['poolSupportsMulticall', poolAddress, chainId],
    enabled: !!poolAddress,
    staleTime: Infinity,
  });
};
