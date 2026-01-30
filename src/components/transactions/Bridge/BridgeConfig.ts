import { ChainId } from '@aave/contract-helpers';
import {
  AaveV3Arbitrum,
  AaveV3ArbitrumSepolia,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3BaseSepolia,
  AaveV3Ethereum,
  AaveV3Gnosis,
  AaveV3InkWhitelabel,
  AaveV3Sepolia,
  GhoArbitrum,
  GhoAvalanche,
  GhoBase,
  GhoEthereum,
  GhoGnosis,
  GhoInk,
  GhoMantle,
} from '@bgd-labs/aave-address-book';
import { constants } from 'ethers';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { BaseNetworkConfig, networkConfigs } from 'src/ui-config/networksConfig';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';
import { SubgraphKey } from 'src/utils/subgraphRequest';

export const bridgeGasLimit = '252000';

type Config = {
  sourceChainId: ChainId | number;
  router: string;
  chainSelector: string;
  subgraphKey: SubgraphKey | 'unsupported';
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
    sourceChainId: ChainId.mainnet,
    chainSelector: '5009297550715157269',
    lockReleaseTokenPool: GhoEthereum.GHO_CCIP_TOKEN_POOL,
    router: '0x80226fc0ee2b096224eeac085bb9a8cba1146f7d',
    tokenOracle: '0x3f12643d3f6f874d39c2a4c9f2cd6f2dbac877fc', // CL Feed
    wrappedNativeOracle: AaveV3Ethereum.ASSETS.WETH.ORACLE,
    subgraphKey: 'ccip-mainnet',
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: ChainId.mainnet,
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
        chainId: ChainId.mainnet,
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
    burnMintTokenPool: GhoArbitrum.GHO_CCIP_TOKEN_POOL,
    router: '0x141fa059441e0ca23ce184b6a78bafd2a517dde8',
    tokenOracle: AaveV3Arbitrum.ASSETS.GHO.ORACLE,
    wrappedNativeOracle: AaveV3Arbitrum.ASSETS.WETH.ORACLE,
    subgraphKey: 'ccip-arbitrum',
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Arbitrum.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: ChainId.arbitrum_one,
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
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
  {
    sourceChainId: ChainId.base,
    chainSelector: '15971525489660198786',
    burnMintTokenPool: GhoBase.GHO_CCIP_TOKEN_POOL,
    router: '0x881e3A65B4d4a04dD529061dd0071cf975F58bCD',
    tokenOracle: '0x42868EFcee13C0E71af89c04fF7d96f5bec479b0',
    wrappedNativeOracle: AaveV3Base.ASSETS.WETH.ORACLE,
    subgraphKey: 'ccip-base',
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Base.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: ChainId.base,
        oracle: AaveV3Base.ASSETS.GHO.ORACLE,
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
        chainId: ChainId.base,
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
  {
    sourceChainId: ChainId.avalanche,
    chainSelector: '6433500567565415381',
    burnMintTokenPool: GhoAvalanche.GHO_CCIP_TOKEN_POOL,
    router: '0xF4c7E640EdA248ef95972845a62bdC74237805dB',
    tokenOracle: '0x360d8aa8F6b09B7BC57aF34db2Eb84dD87bf4d12',
    wrappedNativeOracle: AaveV3Avalanche.ASSETS.WAVAX.ORACLE,
    subgraphKey: 'ccip-avax',
    feeTokens: [
      {
        name: 'Gho Token',
        address: AaveV3Avalanche.ASSETS.GHO.UNDERLYING,
        symbol: 'GHO',
        decimals: 18,
        chainId: ChainId.avalanche,
        oracle: AaveV3Avalanche.ASSETS.GHO.ORACLE,
        extensions: {
          isNative: false,
        },
        balance: '0',
      },
      {
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18,
        address: constants.AddressZero, // Use zero address for network token ccip
        chainId: ChainId.avalanche,
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
  {
    sourceChainId: ChainId.xdai,
    chainSelector: '465200170687744372',
    burnMintTokenPool: GhoGnosis.GHO_CCIP_TOKEN_POOL,
    router: '0x4aAD6071085df840abD9Baf1697d5D5992bDadce',
    tokenOracle: '0x360d8aa8F6b09B7BC57aF34db2Eb84dD87bf4d12',
    wrappedNativeOracle: AaveV3Gnosis.ASSETS.WXDAI.ORACLE,
    subgraphKey: 'ccip-gnosis',
    feeTokens: [
      {
        name: 'XDAI',
        symbol: 'XDAI',
        decimals: 18,
        address: constants.AddressZero, // Use zero address for network token ccip
        chainId: ChainId.xdai,
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
  {
    sourceChainId: ChainId.ink,
    chainSelector: '3461204551265785888',
    burnMintTokenPool: GhoInk.GHO_CCIP_TOKEN_POOL,
    router: '0xca7c90A52B44E301AC01Cb5EB99b2fD99339433A',
    tokenOracle: '0x20fd5f3FCac8883a3A0A2bBcD658A2d2c6EFa6B6',
    wrappedNativeOracle: AaveV3InkWhitelabel.ASSETS.WETH.ORACLE,
    subgraphKey: 'ccip-ink',
    feeTokens: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: constants.AddressZero, // Use zero address for network token ccip
        chainId: ChainId.ink,
        extensions: {
          isNative: true,
        },
        balance: '0',
      },
    ],
  },
  {
    sourceChainId: ChainId.mantle,
    chainSelector: '1556008542357238666',
    burnMintTokenPool: GhoMantle.GHO_CCIP_TOKEN_POOL,
    router: '0x670052635a9850bb45882Cb2eCcF66bCff0F41B7',
    tokenOracle: '0x360d8aa8F6b09B7BC57aF34db2Eb84dD87bf4d12',
    wrappedNativeOracle: '0xD97F20bEbeD74e8144134C4b148fE93417dd0F96',
    subgraphKey: 'unsupported',
    feeTokens: [
      {
        name: 'Mantle',
        symbol: 'MNT',
        decimals: 18,
        address: constants.AddressZero, // Use zero address for network token ccip
        chainId: ChainId.mantle,
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
    lockReleaseTokenPool: '0xd8bDb685320f7118085d5C8D0c2016A644881D40',
    chainSelector: '16015286601757825753',
    router: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    tokenOracle: '0x98458D6A99489F15e6eB5aFa67ACFAcf6F211051', // mock oracle
    wrappedNativeOracle: AaveV3Sepolia.ASSETS.WETH.ORACLE,
    subgraphKey: 'ccip-sepolia',
    feeTokens: [
      // {
      //   name: 'Gho Token',
      //   address: AaveV3Sepolia.ASSETS.GHO.UNDERLYING,
      //   symbol: 'GHO',
      //   decimals: 18,
      //   chainId: 11155111,
      //   logoURI:
      //     'https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png?1720517092',
      //   oracle: AaveV3Sepolia.ASSETS.GHO.ORACLE,
      //   extensions: {
      //     isNative: false,
      //   },
      //   balance: '0',
      // },
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
    burnMintTokenPool: '0xb4A1e95A2FA7ed83195C6c16660fCCa720163FF6',
    chainSelector: '3478487238524512106',
    router: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
    tokenOracle: '0x1f885520b7BD528E46b390040F12E753Dce43004', // mock oracle
    wrappedNativeOracle: AaveV3ArbitrumSepolia.ASSETS.WETH.ORACLE,
    subgraphKey: 'ccip-arb-sepolia',
    feeTokens: [
      // {
      //   name: 'Gho Token',
      //   address: AaveV3Sepolia.ASSETS.GHO.UNDERLYING,
      //   symbol: 'GHO',
      //   decimals: 18,
      //   chainId: 421614,
      //   logoURI:
      //     'https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png?1720517092',
      //   oracle: AaveV3Sepolia.ASSETS.GHO.ORACLE,
      //   extensions: {
      //     isNative: false,
      //   },
      //   balance: '0',
      // },
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
  {
    sourceChainId: ChainId.base_sepolia,
    burnMintTokenPool: '0x2a33945f942913b730aB36A24150A96c3D0CC9E9',
    chainSelector: '10344971235874465080',
    router: '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93',
    tokenOracle: '0xFD5ea2e57CDC98D371D8eA899d1F2C24bfFb39BD',
    wrappedNativeOracle: AaveV3BaseSepolia.ASSETS.WETH.ORACLE,
    subgraphKey: 'ccip-base-sepolia',
    feeTokens: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: constants.AddressZero,
        chainId: ChainId.base_sepolia,
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
