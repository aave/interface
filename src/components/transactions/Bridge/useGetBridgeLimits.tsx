import { useEffect, useState } from 'react';

import { getChainSelectorFor } from './BridgeConfig';

interface BridgingValues {
  currentAmountBridged: number;
  maxAmountBridged: number;
}

function simulateBridgingValuesCall() {
  return new Promise<BridgingValues>((resolve) => {
    setTimeout(() => {
      resolve({ currentAmountBridged: 100, maxAmountBridged: 200 });
    }, 1000);
  });
}

export const useBridgingValues = () => {
  const [bridgingValues, setBridgingValues] = useState({
    currentAmountBridged: 0,
    maxAmountBridged: 0,
  });

  useEffect(() => {
    async function fetchBridgingValues() {
      try {
        const result = await simulateBridgingValuesCall();
        setBridgingValues(result);
      } catch (error) {
        console.error('Error fetching bridging values:', error);
      }
    }
    fetchBridgingValues();
  }, []);

  return bridgingValues;
};

function simulateGetCurrentOutboundRateLimiterState(remoteChainSelector: string) {
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      console.log(remoteChainSelector);
      resolve(150);
    }, 1000);
  });
}

export const useRateLimit = (destinationChainId: number) => {
  const [rateLimit, setRateLimit] = useState(0);
  const destinationChainSelector = getChainSelectorFor(destinationChainId);

  useEffect(() => {
    async function fetchRateLimit() {
      try {
        const result = await simulateGetCurrentOutboundRateLimiterState(destinationChainSelector);
        setRateLimit(result);
      } catch (error) {
        console.error('Error fetching rate limit:', error);
      }
    }
    fetchRateLimit();
  }, []);

  return rateLimit;
};
