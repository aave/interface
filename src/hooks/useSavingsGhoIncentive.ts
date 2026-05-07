import {
  chainId as sdkChainId,
  useSavingsGhoIncentive as useSdkSavingsGhoIncentive,
} from '@aave/react';

const MAINNET_CHAIN_ID = 1;

type UseSavingsGhoIncentiveArgs = {
  chainId?: number;
};

export const useSavingsGhoIncentive = ({
  chainId = MAINNET_CHAIN_ID,
}: UseSavingsGhoIncentiveArgs = {}) => {
  return useSdkSavingsGhoIncentive({
    chainId: sdkChainId(chainId),
  });
};
