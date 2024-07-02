import { useQuery } from '@tanstack/react-query';
import { BigNumber, Contract } from 'ethers';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { getChainSelectorFor, laneConfig } from './BridgeConfig';
// NOTE: lightweight ABI
import TokenPoolAbi from './Tokenpool-abi.json';

export const useGetBridgeLimit = (sourceChainId: number) => {
  return useQuery({
    queryFn: async () => {
      const sourceLaneConfig = laneConfig.find((config) => config.sourceChainId === sourceChainId);
      if (!sourceLaneConfig) {
        throw Error('No sourceLaneConfig found');
      }

      const provider = getProvider(sourceChainId);
      const tokenPoolAddress = sourceLaneConfig.lockReleaseTokenPool;

      if (!tokenPoolAddress) {
        // only applies to the lock release token pool on Ethereum
        return {
          bridgeLimit: BigNumber.from(-1),
          currentBridgedAmount: BigNumber.from(-1),
        };
      }

      const tokenPool = new Contract(tokenPoolAddress, TokenPoolAbi, provider);

      const [bridgeLimit, currentBridgedAmount]: [BigNumber, BigNumber] = await Promise.all([
        tokenPool.getBridgeLimit(),
        tokenPool.getCurrentBridgedAmount(),
      ]);

      return {
        bridgeLimit,
        currentBridgedAmount,
      };
    },
    queryKey: ['getBridgeLimit', sourceChainId],
    // always fetch data to get most recent bridged amounts
    cacheTime: 0,
    staleTime: 0,
  });
};

interface RateLimitProps {
  destinationChainId: number;
  sourceChainId: number;
}

export const useGetRateLimit = ({ destinationChainId, sourceChainId }: RateLimitProps) => {
  return useQuery({
    queryFn: async () => {
      const sourceLaneConfig = laneConfig.find((config) => config.sourceChainId === sourceChainId);
      if (!sourceLaneConfig) {
        throw Error('No sourceLaneConfig found');
      }

      const tokenPoolAddress =
        sourceLaneConfig.lockReleaseTokenPool ?? sourceLaneConfig.burnMintTokenPool;

      if (!tokenPoolAddress) {
        return BigNumber.from(0);
      }

      const provider = getProvider(sourceChainId);
      const tokenPool = new Contract(tokenPoolAddress, TokenPoolAbi, provider);
      const destinationChainSelector = getChainSelectorFor(destinationChainId);

      const [tokens, , isEnabled, ,]: [BigNumber, number, boolean, BigNumber, BigNumber] =
        await tokenPool.getCurrentOutboundRateLimiterState(destinationChainSelector);

      return isEnabled ? tokens : BigNumber.from(0);
    },
    queryKey: ['getRateLimit', destinationChainId, sourceChainId],
    cacheTime: 0,
    staleTime: 0,
  });
};
