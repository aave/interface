import { ChainId } from '@aave/contract-helpers';
import {
  AaveV3Arbitrum,
  AaveV3ArbitrumSepolia,
  AaveV3Ethereum,
  AaveV3Sepolia,
} from '@bgd-labs/aave-address-book';
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
  destinations: {
    destinationChainId: ChainId;
    onRamp: string;
  }[];
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
    sourceChainId: ChainId.mainnet,
    chainSelector: '5009297550715157269',
    lockReleaseTokenPool: '0x5756880b6a1eaba0175227bf02a7e87c1e02b28c', // TODO: address book
    router: '0x80226fc0ee2b096224eeac085bb9a8cba1146f7d',
    tokenOracle: '0x3f12643d3f6f874d39c2a4c9f2cd6f2dbac877fc',
    wrappedNativeOracle: AaveV3Ethereum.ASSETS.WETH.ORACLE,
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY}/subgraphs/id/E11p8T4Ff1DHZbwSUC527hkUb5innVMdTuP6A2s1xtm1`,
    destinations: [
      {
        destinationChainId: ChainId.arbitrum_one,
        onRamp: '0x925228d7b82d883dde340a55fe8e6da56244a22c',
      },
    ],
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: 1,
        logoURI:
          'https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png?1720517092',
        oracle: AaveV3Ethereum.ASSETS.GHO.ORACLE,
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
        chainId: 1,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
  {
    sourceChainId: ChainId.arbitrum_one,
    chainSelector: '4949039107694359620',
    burnMintTokenPool: '0xf168b83598516a532a85995b52504a2fa058c068', // TODO: address book
    router: '0x141fa059441e0ca23ce184b6a78bafd2a517dde8',
    tokenOracle: '0xb05984ad83c20b3ade7bf97a9a0cb539dde28dbb',
    wrappedNativeOracle: AaveV3Arbitrum.ASSETS.WETH.ORACLE,
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY}/subgraphs/id/GPpZfiGoDChLsiWoMG5fxXdRNEYrsVDrKJ39moGcbz6i`,
    destinations: [
      {
        destinationChainId: ChainId.mainnet,
        onRamp: '0xce11020d56e5fdbfe46d9fc3021641ffbbb5adee',
      },
    ],
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Arbitrum.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: 42161,
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
        chainId: 42161, // Arb
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
    sourceChainId: ChainId.sepolia,
    lockReleaseTokenPool: '0x7768248E1Ff75612c18324bad06bb393c1206980',
    chainSelector: '16015286601757825753',
    router: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    tokenOracle: '0x98458D6A99489F15e6eB5aFa67ACFAcf6F211051', // mock oracle
    wrappedNativeOracle: AaveV3Sepolia.ASSETS.WETH.ORACLE,
    subgraphUrl: 'https://api.studio.thegraph.com/query/75867/gho-ccip-sepolia/version/latest',
    destinations: [
      {
        destinationChainId: ChainId.arbitrum_sepolia,
        onRamp: '0xBc09627e58989Ba8F1eDA775e486467d2A00944F',
      },
    ],
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Sepolia.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: 11155111,
        logoURI:
          'https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png?1720517092',
        oracle: AaveV3Sepolia.ASSETS.GHO.ORACLE,
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
        chainId: 11155111,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
  {
    sourceChainId: ChainId.arbitrum_sepolia,
    burnMintTokenPool: '0x3eC2b6F818B72442fc36561e9F930DD2b60957D2',
    chainSelector: '3478487238524512106',
    router: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
    tokenOracle: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165', // mock oracle
    wrappedNativeOracle: AaveV3ArbitrumSepolia.ASSETS.WETH.ORACLE,
    subgraphUrl: 'https://api.studio.thegraph.com/query/75867/gho-ccip-arb-sepolia/version/latest',
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0x64d78F20aD987c7D52FdCB8FB0777bD00de53210',
      },
    ],
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Sepolia.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: 421614,
        logoURI:
          'https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png?1720517092',
        oracle: AaveV3Sepolia.ASSETS.GHO.ORACLE,
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

export function getDestinationChainFor(sourceChainId: ChainId, onRamp: string) {
  const destinationChainId = laneConfig
    .find((config) => config.sourceChainId === sourceChainId)
    ?.destinations.find((dest) => dest.onRamp === onRamp)?.destinationChainId;
  if (!destinationChainId) {
    throw new Error(`No destination chain found for onRamp ${onRamp}`);
  }
  return destinationChainId;
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
