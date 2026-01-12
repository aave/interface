import { ChainId } from '@aave/contract-helpers';
import { AaveV3Arbitrum, AaveV3ArbitrumSepolia, GhoArbitrum } from '@bgd-labs/aave-address-book';
import { constants } from 'ethers';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { BaseNetworkConfig, networkConfigs } from 'src/ui-config/networksConfig';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';

export const bridgeGasLimit = '252000';

type Config = {
  sourceChainId: ChainId;
  router: string;
  chainSelector: string;
  subgraphUrl: string;
  tokenOracle: string; // Used to get the GHO price
  wrappedNativeOracle: string; // Used to get the fee price in USD
  lockReleaseTokenPool?: string; // Only exists on Ethereum
  burnMintTokenPool?: string; // Only exists on non-Ethereum networks
  feeTokens: TokenInfoWithBalance[];
};

export enum MessageExecutionState {
  UNTOUCHED = 0,
  IN_PROGRESS,
  SUCCESS,
  FAILURE,
}

export interface SupportedNetworkWithChainId extends BaseNetworkConfig {
  chainId: number;
}

const prodConfig: Config[] = [
  {
    sourceChainId: ChainId.arbitrum_one,
    chainSelector: '4949039107694359620',
    burnMintTokenPool: GhoArbitrum.GHO_CCIP_TOKEN_POOL,
    router: '0x141fa059441e0ca23ce184b6a78bafd2a517dde8',
    tokenOracle: AaveV3Arbitrum.ASSETS.GHO.ORACLE,
    wrappedNativeOracle: AaveV3Arbitrum.ASSETS.WETH.ORACLE,
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY}/subgraphs/id/GPpZfiGoDChLsiWoMG5fxXdRNEYrsVDrKJ39moGcbz6i`,
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Arbitrum.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: ChainId.arbitrum_one,
        logoURI:
          'https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png?1720517092',
        oracle: AaveV3Arbitrum.ASSETS.GHO.ORACLE,
        extensions: {
          isNative: false,
        },
        balance: '0',
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: constants.AddressZero, // Use zero address for network token ccip
        chainId: ChainId.arbitrum_one,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
];

const testnetConfig: Config[] = [
  {
    sourceChainId: ChainId.arbitrum_sepolia,
    burnMintTokenPool: '0xb4A1e95A2FA7ed83195C6c16660fCCa720163FF6',
    chainSelector: '3478487238524512106',
    router: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
    tokenOracle: '0x1f885520b7BD528E46b390040F12E753Dce43004', // mock oracle
    wrappedNativeOracle: AaveV3ArbitrumSepolia.ASSETS.WETH.ORACLE,
    subgraphUrl: `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY}/subgraphs/id/8bpqvL6XBCVhN4heE9rdEwgTketeZ2U5vVGEh5fDoUEH`,
    feeTokens: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: constants.AddressZero, // Use zero address for network token ccip
        chainId: 421614, // Arb
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
];

export const laneConfig = ENABLE_TESTNET ? testnetConfig : prodConfig;

export function getChainSelectorFor(chainId: ChainId) {
  const chainSelector = laneConfig.find(
    (config) => config.sourceChainId === chainId
  )?.chainSelector;
  if (!chainSelector) {
    throw new Error(`No chainSelector found for chain ${chainId}`);
  }
  return chainSelector;
}

export function getChainIdFor(chainSelector: string) {
  const chainId = laneConfig.find(
    (config) => config.chainSelector === chainSelector
  )?.sourceChainId;
  if (!chainId) {
    throw new Error(`No chainId found for chainSelector ${chainSelector}`);
  }
  return chainId;
}

export function getRouterFor(chainId: ChainId) {
  const router = laneConfig.find((config) => config.sourceChainId === chainId)?.router;
  if (!router) {
    throw new Error(`No router found for chain ${chainId}`);
  }
  return router;
}

export function getSupportedSourceChains() {
  return laneConfig.map((config) => config.sourceChainId);
}

export function getConfigFor(sourceChainId: ChainId) {
  const config = laneConfig.find((config) => config.sourceChainId === sourceChainId);
  if (!config) {
    throw new Error(`No config found for chain ${sourceChainId}`);
  }
  return config;
}

export const supportedNetworksWithBridge: SupportedNetworkWithChainId[] =
  getSupportedSourceChains().map((chainId) => ({
    ...networkConfigs[chainId],
    chainId,
  }));
