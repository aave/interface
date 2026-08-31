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

/**
 * Only applies if there was an rpc error. A successful answer cached and never refetched.
 */
const ERROR_RETRY_INTERVAL = 30_000;

export const usePoolSupportsMulticall = (marketData: MarketDataType) => {
  const poolAddress = marketData.addresses.LENDING_POOL;
  const chainId = marketData.chainId;

  return useQuery({
    queryFn: async () => {
      // Errors are deliberately not swallowed. ethers reports a reverted call
      // and an unreachable RPC with the same code, so there is no way to tell a
      // pool that lacks the getter from a transient failure — and catching both
      // would cache a false negative for the rest of the session. Letting the
      // error through lets react-query retry; callers read the absent value as
      // "no multicall", which is the safe default either way.
      const provider = getProvider(chainId);
      const revision = await new Contract(poolAddress, POOL_REVISION_ABI, provider).POOL_REVISION();
      return revision.gte(MULTICALL_POOL_REVISION);
    },
    queryKey: ['poolSupportsMulticall', poolAddress, chainId],
    enabled: !!poolAddress,
    staleTime: Infinity,
    // The default retries cover a blip; this keeps trying through a longer
    // outage so the bundled flows come back without a page reload.
    refetchInterval: (query) => (query.state.status === 'error' ? ERROR_RETRY_INTERVAL : false),
  });
};
