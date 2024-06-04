// Note taken from
// https://github.com/smartcontractkit/smart-contract-examples/blob/main/ccip-offchain/javascript/src/config/router.js
import { ChainId } from '@aave/contract-helpers';
import { AaveV3ArbitrumSepolia, AaveV3Sepolia } from '@bgd-labs/aave-address-book';
import { BaseNetworkConfig, networkConfigs } from 'src/ui-config/networksConfig';

type Config = {
  sourceChainId: ChainId;
  router: string;
  chainSelector: string;
  subgraphUrl: string;
  wrappedNativeOracle: string;
  lockReleaseTokenPool?: string;
  burnMintTokenPool?: string;
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

// TODO: make testnet and mainnet config
export const laneConfig: Config[] = [
  {
    sourceChainId: ChainId.sepolia,
    lockReleaseTokenPool: '0x7768248E1Ff75612c18324bad06bb393c1206980', // TODO: address book
    chainSelector: '16015286601757825753',
    router: '0x11C008349c41fB5c78E544397fb4613605Ec1a74'.toLowerCase(),
    wrappedNativeOracle: AaveV3Sepolia.ASSETS.WETH.ORACLE,
    subgraphUrl: 'https://api.studio.thegraph.com/query/75867/gho-ccip-sepolia/version/latest',
    destinations: [
      {
        destinationChainId: ChainId.arbitrum_sepolia,
        onRamp: '0x1f41c443Cf68750d5c195E2EA7051521d981fC77'.toLowerCase(),
      },
      // {
      //   destinationChainId: ChainId.fuji,
      //   onRamp: '0x0477cA0a35eE05D3f9f424d88bC0977ceCf339D4'.toLowerCase(),
      // },
      // {
      //   destinationChainId: ChainId.base_sepolia,
      //   onRamp: '0x2B70a05320cB069e0fB55084D402343F832556E7'.toLowerCase(),
      // },
    ],
  },
  {
    sourceChainId: ChainId.arbitrum_sepolia,
    burnMintTokenPool: '0x3eC2b6F818B72442fc36561e9F930DD2b60957D2', // TODO: address book
    chainSelector: '3478487238524512106',
    router: '0x22356aec4Cf05ec0EC63daa576C6B2CE1DC64701'.toLowerCase(),
    wrappedNativeOracle: AaveV3ArbitrumSepolia.ASSETS.WETH.ORACLE,
    subgraphUrl: 'https://api.studio.thegraph.com/query/75867/gho-ccip-arb-sepolia/version/latest',
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0xc1eBd046A4086142479bE3Fc16A4791E2022909a'.toLowerCase(),
      },
      // {
      //   destinationChainId: ChainId.base_sepolia,
      //   onRamp: '0x7854E73C73e7F9bb5b0D5B4861E997f4C6E8dcC6'.toLowerCase(),
      // },
    ],
  },
  // {
  //   sourceChainId: ChainId.fuji,
  //   chainSelector: '14767482510784806043',
  //   tokenPool: '', // TODO: address book

  //   router: '0xF694E193200268f9a4868e4Aa017A0118C9a8177'.toLowerCase(),
  //   wrappedNativeOracle: AaveV3Fuji.ASSETS.WAVAX.ORACLE,
  //   subgraphUrl:
  //     'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-fuji/1.0.0/gn',
  //   destinations: [
  //     {
  //       destinationChainId: ChainId.sepolia,
  //       onRamp: '0x5724B4Cc39a9690135F7273b44Dfd3BA6c0c69aD'.toLowerCase(),
  //     },
  //     {
  //       destinationChainId: ChainId.base_sepolia,
  //       onRamp: '0x1A674645f3EB4147543FCA7d40C5719cbd997362'.toLowerCase(),
  //     },
  //   ],
  // },
  // {
  //   sourceChainId: ChainId.base_sepolia,
  //   tokenPool: '', // TODO: address book

  //   chainSelector: '10344971235874465080',
  //   router: '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93'.toLowerCase(),
  //   wrappedNativeOracle: AaveV3BaseSepolia.ASSETS.WETH.ORACLE,

  //   subgraphUrl:
  //     'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-base-sepolia/1.0.0/gn',
  //   destinations: [
  //     {
  //       destinationChainId: ChainId.sepolia,
  //       onRamp: '0x6486906bB2d85A6c0cCEf2A2831C11A2059ebfea'.toLowerCase(),
  //     },
  //     {
  //       destinationChainId: ChainId.arbitrum_sepolia,
  //       onRamp: '0x58622a80c6DdDc072F2b527a99BE1D0934eb2b50'.toLowerCase(),
  //     },
  //     {
  //       destinationChainId: ChainId.fuji,
  //       onRamp: '0xAbA09a1b7b9f13E05A6241292a66793Ec7d43357'.toLowerCase(),
  //     },
  //   ],
  // },
];

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

export const supportedNetworksWithBridge: SupportedNetworkWithChainId[] =
  getSupportedSourceChains().map((chainId) => ({
    ...networkConfigs[chainId],
    chainId,
  }));
