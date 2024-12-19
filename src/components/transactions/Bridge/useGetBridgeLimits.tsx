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
          bridgeLimit: '-1',
          currentBridgedAmount: '-1',
          remainingAmount: '-1',
        };
      }

      const tokenPool = new Contract(tokenPoolAddress, TokenPoolAbi, provider);

      const [bridgeLimit, currentBridgedAmount]: [BigNumber, BigNumber] = await Promise.all([
        tokenPool.getBridgeLimit(),
        tokenPool.getCurrentBridgedAmount(),
      ]);

      return {
        bridgeLimit: bridgeLimit.toString(),
        currentBridgedAmount: currentBridgedAmount.toString(),
        remainingAmount: bridgeLimit.sub(currentBridgedAmount).toString(),
      };
    },
    queryKey: ['getBridgeLimit', sourceChainId],
    // always fetch data to get most recent bridged amounts
    gcTime: 0,
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
        return {
          tokens: '0',
          capacity: '0',
          rate: '0',
        };
      }

      const provider = getProvider(sourceChainId);
      const tokenPool = new Contract(tokenPoolAddress, TokenPoolAbi, provider);
      const destinationChainSelector = getChainSelectorFor(destinationChainId);

      const [tokens, , isEnabled, capacity, rate]: [
        BigNumber,
        number,
        boolean,
        BigNumber,
        BigNumber
      ] = await tokenPool.getCurrentOutboundRateLimiterState(destinationChainSelector);

      return {
        tokens: isEnabled ? tokens.toString() : '0',
        capacity: capacity.toString(),
        rate: rate.toString(),
      };
    },
    queryKey: ['getRateLimit', destinationChainId, sourceChainId],
    staleTime: 0,
    refetchInterval: 5000, // fetch ever 5 seconds to get the latest rate limits
  });
};
