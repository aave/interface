import { Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { getChainSelectorFor, laneConfig } from './BridgeConfig';
// NOTE: lightweight ABI
import TokenPoolAbi from './Tokenpool-abi.json';

export const useBridgingValues = (sourceChainId: number) => {
  const [bridgingValues, setBridgingValues] = useState({
    currentAmountBridged: 0,
    maxAmountBridged: 0,
  });

  useEffect(() => {
    const sourceLaneConfig = laneConfig.find((config) => config.sourceChainId === sourceChainId);
    if (!sourceLaneConfig) {
      throw Error('No sourceLaneConfig found');
    }

    const provider = getProvider(sourceChainId);
    const tokenPoolAddress = sourceLaneConfig.tokenPool;
    const tokenPool = new Contract(tokenPoolAddress, TokenPoolAbi, provider);

    async function fetchBridgingValues() {
      try {
        const maxAmountBridged = await tokenPool.getBridgeLimit();
        const currentAmountBridged = await tokenPool.getCurrentBridgedAmount();
        setBridgingValues({
          maxAmountBridged: parseInt(formatUnits(maxAmountBridged, 18), 10),
          currentAmountBridged: parseInt(formatUnits(currentAmountBridged, 18), 10),
        });
      } catch (error) {
        console.error('Error fetching bridging values:', error);
      }
    }

    fetchBridgingValues();
  }, [sourceChainId]);

  return bridgingValues;
};

// NOTE: Currently useRateLimit is not set on governance
interface RateLimitProps {
  destinationChainId: number;
  sourceChainId: number;
}
export const useRateLimit = ({ destinationChainId, sourceChainId }: RateLimitProps) => {
  const [rateLimit, setRateLimit] = useState(0);

  const { provider } = useWeb3Context();

  useEffect(() => {
    if (!provider) {
      console.error('Provider is not available');
      return;
    }

    const sourceLaneConfig = laneConfig.find((config) => config.sourceChainId === sourceChainId);
    if (!sourceLaneConfig) {
      throw Error('No sourceLaneConfig found');
    }

    const tokenPoolAddress = sourceLaneConfig.tokenPool;
    const signer = provider.getSigner();
    const tokenPool = new Contract(tokenPoolAddress, TokenPoolAbi, signer);
    const destinationChainSelector = getChainSelectorFor(destinationChainId);

    async function fetchRateLimit() {
      try {
        const [rate, , isEnabled, ,] = await tokenPool.getCurrentOutboundRateLimiterState(
          destinationChainSelector
        );
        if (!isEnabled) {
          setRateLimit(0);
        } else {
          setRateLimit(parseInt(rate.toString(), 10));
        }
      } catch (error) {
        console.error('Error fetching rate limit:', error);
      }
    }

    fetchRateLimit();
  }, [destinationChainId, sourceChainId, provider]);

  return rateLimit;
};
