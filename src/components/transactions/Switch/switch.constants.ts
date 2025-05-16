import { ChainId } from '@aave/contract-helpers';
import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { TOKEN_LIST } from 'src/ui-config/TokenList';

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
] as const;

export const WrappedNativeTokens: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]:
    TOKEN_LIST.tokens.find(
      (token) => token.chainId === SupportedChainId.MAINNET && token.symbol === 'WETH'
    )?.address ?? '',
  [SupportedChainId.GNOSIS_CHAIN]:
    TOKEN_LIST.tokens.find(
      (token) => token.chainId === SupportedChainId.GNOSIS_CHAIN && token.symbol === 'WETH'
    )?.address ?? '',
  [SupportedChainId.ARBITRUM_ONE]:
    TOKEN_LIST.tokens.find(
      (token) => token.chainId === SupportedChainId.ARBITRUM_ONE && token.symbol === 'WETH'
    )?.address ?? '',
  [SupportedChainId.BASE]:
    TOKEN_LIST.tokens.find(
      (token) => token.chainId === SupportedChainId.BASE && token.symbol === 'WETH'
    )?.address ?? '',
  [SupportedChainId.SEPOLIA]:
    TOKEN_LIST.tokens.find(
      (token) => token.chainId === SupportedChainId.SEPOLIA && token.symbol === 'WETH'
    )?.address ?? '',
  [SupportedChainId.POLYGON]:
    TOKEN_LIST.tokens.find(
      (token) => token.chainId === SupportedChainId.POLYGON && token.symbol === 'WMATIC'
    )?.address ?? '',
  [SupportedChainId.AVALANCHE]:
    TOKEN_LIST.tokens.find(
      (token) => token.chainId === SupportedChainId.AVALANCHE && token.symbol === 'WAVAX'
    )?.address ?? '',
};

export const isChainIdSupportedByCoWProtocol = (chainId: number): chainId is SupportedChainId => {
  return CoWProtocolSupportedNetworks.includes(chainId);
};
