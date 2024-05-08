// Note taken from
// https://github.com/smartcontractkit/smart-contract-examples/blob/main/ccip-offchain/javascript/src/config/router.js
import { ChainId } from '@aave/contract-helpers';

type Config = {
  sourceChainId: ChainId;
  router: string;
  chainSelector: string;
  subgraphUrl: string;
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

// TODO: make testnet and mainnet config
export const laneConfig: Config[] = [
  {
    sourceChainId: ChainId.sepolia,
    chainSelector: '16015286601757825753',
    router: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59'.toLowerCase(),
    subgraphUrl:
      'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-sepolia/1.0.0/gn',
    destinations: [
      {
        destinationChainId: ChainId.arbitrum_sepolia,
        onRamp: '0xe4Dd3B16E09c016402585a8aDFdB4A18f772a07e'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.fuji,
        onRamp: '0x0477cA0a35eE05D3f9f424d88bC0977ceCf339D4'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.base_sepolia,
        onRamp: '0x2B70a05320cB069e0fB55084D402343F832556E7'.toLowerCase(),
      },
    ],
  },
  {
    sourceChainId: ChainId.arbitrum_sepolia,
    chainSelector: '3478487238524512106',
    router: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165'.toLowerCase(),
    subgraphUrl:
      'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-arb-sepolia/1.0.0/gn',
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0x4205E1Ca0202A248A5D42F5975A8FE56F3E302e9'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.base_sepolia,
        onRamp: '0x7854E73C73e7F9bb5b0D5B4861E997f4C6E8dcC6'.toLowerCase(),
      },
    ],
  },
  {
    sourceChainId: ChainId.fuji,
    chainSelector: '14767482510784806043',
    router: '0xF694E193200268f9a4868e4Aa017A0118C9a8177'.toLowerCase(),
    subgraphUrl:
      'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-fuji/1.0.0/gn',
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0x5724B4Cc39a9690135F7273b44Dfd3BA6c0c69aD'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.base_sepolia,
        onRamp: '0x1A674645f3EB4147543FCA7d40C5719cbd997362'.toLowerCase(),
      },
    ],
  },
  {
    sourceChainId: ChainId.base_sepolia,
    chainSelector: '10344971235874465080',
    router: '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93'.toLowerCase(),
    subgraphUrl:
      'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-base-sepolia/1.0.0/gn',
    destinations: [
      {
        destinationChainId: ChainId.sepolia,
        onRamp: '0x6486906bB2d85A6c0cCEf2A2831C11A2059ebfea'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.arbitrum_sepolia,
        onRamp: '0x58622a80c6DdDc072F2b527a99BE1D0934eb2b50'.toLowerCase(),
      },
      {
        destinationChainId: ChainId.fuji,
        onRamp: '0xAbA09a1b7b9f13E05A6241292a66793Ec7d43357'.toLowerCase(),
      },
    ],
  },
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
