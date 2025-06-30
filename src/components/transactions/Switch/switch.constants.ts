import { ChainId } from '@aave/contract-helpers';
import { SupportedChainId } from '@cowprotocol/cow-sdk';

// In the future, we may fetch these configs from our features flag service

export const ParaswapSupportedNetworks = [
  ChainId.mainnet,
  ChainId.polygon,
  ChainId.avalanche,
  ChainId.sepolia,
  ChainId.base,
  ChainId.arbitrum_one,
  ChainId.optimism,
  ChainId.xdai,
  ChainId.bnb,
];

SupportedChainId;

export const CoWProtocolSupportedNetworks = [
  SupportedChainId.MAINNET,
  SupportedChainId.GNOSIS_CHAIN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.BASE,
  SupportedChainId.SEPOLIA,
  SupportedChainId.AVALANCHE,
  SupportedChainId.POLYGON,
] as const;

export const isChainIdSupportedByCoWProtocol = (chainId: number): chainId is SupportedChainId => {
  return CoWProtocolSupportedNetworks.includes(chainId);
};
