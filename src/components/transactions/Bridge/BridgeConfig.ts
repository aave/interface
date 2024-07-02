import { ChainId } from '@aave/contract-helpers';
import {
  AaveV3Arbitrum,
  AaveV3ArbitrumSepolia,
  AaveV3Ethereum,
  AaveV3Sepolia,
} from '@bgd-labs/aave-address-book';
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
  },
];

const testnetConfig: Config[] = [
  {
    sourceChainId: ChainId.sepolia,
    lockReleaseTokenPool: '0x7768248E1Ff75612c18324bad06bb393c1206980',
    chainSelector: '16015286601757825753',
    router: '0x11c008349c41fb5c78e544397fb4613605ec1a74',
    tokenOracle: '0x98458D6A99489F15e6eB5aFa67ACFAcf6F211051', // mock oracle
    wrappedNativeOracle: AaveV3Sepolia.ASSETS.WETH.ORACLE,
    subgraphUrl: 'https://api.studio.thegraph.com/query/75867/gho-ccip-sepolia/version/latest',
    destinations: [
      {
        destinationChainId: ChainId.arbitrum_sepolia,
        onRamp: '0x1f41c443cf68750d5c195e2ea7051521d981fc77',
      },
    ],
  },
  {
    sourceChainId: ChainId.arbitrum_sepolia,
    burnMintTokenPool: '0x3eC2b6F818B72442fc36561e9F930DD2b60957D2',
    chainSelector: '3478487238524512106',
    router: '0x22356aec4cf05ec0ec63daa576c6b2ce1dc64701',
    tokenOracle: '0x0153002d20B96532C639313c2d54c3dA09109309', // mock oracle
    wrappedNativeOracle: AaveV3ArbitrumSepolia.ASSETS.WETH.ORACLE,
    subgraphUrl: 'https://api.studio.thegraph.com/query/75867/gho-ccip-arb-sepolia/version/latest',
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0xc1ebd046a4086142479be3fc16a4791e2022909a',
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
