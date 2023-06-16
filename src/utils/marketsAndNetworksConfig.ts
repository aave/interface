import { ChainId, ChainIdToNetwork } from '@aave/contract-helpers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { providers as ethersProviders } from 'ethers';

import {
  CustomMarket,
  MarketDataType,
  marketsData as _marketsData,
} from '../ui-config/marketsConfig';
import {
  BaseNetworkConfig,
  ExplorerLinkBuilderConfig,
  ExplorerLinkBuilderProps,
  NetworkConfig,
  networkConfigs as _networkConfigs,
} from '../ui-config/networksConfig';
import { RotationProvider } from './rotationProvider';

export type Pool = {
  address: string;
};

export const STAGING_ENV = process.env.NEXT_PUBLIC_ENV === 'staging';
export const PROD_ENV = !process.env.NEXT_PUBLIC_ENV || process.env.NEXT_PUBLIC_ENV === 'prod';
export const ENABLE_TESTNET =
  PROD_ENV && global?.window?.localStorage.getItem('testnetsEnabled') === 'true';

// determines if forks should be shown
export const FORK_ENABLED =
  !!process.env.NEXT_PUBLIC_FORK_URL_RPC ||
  global?.window?.localStorage.getItem('forkEnabled') === 'true';
// specifies which network was forked
const FORK_BASE_CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_FORK_BASE_CHAIN_ID) ||
  Number(global?.window?.localStorage.getItem('forkBaseChainId') || 1);
// specifies on which chainId the fork is running
const FORK_CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_FORK_CHAIN_ID) ||
  Number(global?.window?.localStorage.getItem('forkNetworkId') || 3030);
const FORK_RPC_URL =
  process.env.NEXT_PUBLIC_FORK_URL_RPC ||
  global?.window?.localStorage.getItem('forkRPCUrl') ||
  'http://127.0.0.1:8545';
const FORK_WS_RPC_URL =
  process.env.NEXT_PUBLIC_FORK_URL_WS_RPC ||
  global?.window?.localStorage.getItem('forkWsRPCUrl') ||
  'ws://127.0.0.1:8545';

/**
 * Generates network configs based on networkConfigs & fork settings.
 * Forks will have a rpcOnly clone of their underlying base network config.
 */
export const networkConfigs = Object.keys(_networkConfigs).reduce((acc, value) => {
  acc[value] = _networkConfigs[value];
  if (FORK_ENABLED && Number(value) === FORK_BASE_CHAIN_ID) {
    acc[FORK_CHAIN_ID] = {
      ..._networkConfigs[value],
      name: `${_networkConfigs[value].name} Fork`,
      isFork: true,
      privateJsonRPCUrl: FORK_RPC_URL,
      privateJsonRPCWSUrl: FORK_WS_RPC_URL,
      publicJsonRPCUrl: [],
      publicJsonRPCWSUrl: '',
      underlyingChainId: FORK_BASE_CHAIN_ID,
    };
  }
  return acc;
}, {} as { [key: string]: BaseNetworkConfig });

/**
 * Generates network configs based on marketsData & fork settings.
 * Fork markets are generated for all markets on the underlying base chain.
 */

export const marketsData = Object.keys(_marketsData).reduce((acc, value) => {
  acc[value] = _marketsData[value as keyof typeof CustomMarket];
  if (
    FORK_ENABLED &&
    _marketsData[value as keyof typeof CustomMarket].chainId === FORK_BASE_CHAIN_ID
  ) {
    acc[`fork_${value}`] = {
      ..._marketsData[value as keyof typeof CustomMarket],
      chainId: FORK_CHAIN_ID,
      isFork: true,
    };
  }
  return acc;
}, {} as { [key: string]: MarketDataType });

export function getDefaultChainId() {
  return marketsData[availableMarkets[0]].chainId;
}

export function getSupportedChainIds(): number[] {
  return Array.from(
    Object.keys(marketsData)
      .filter((value) => {
        const isTestnet =
          networkConfigs[marketsData[value as keyof typeof CustomMarket].chainId].isTestnet;

        // If this is a staging environment, or the testnet toggle is on, only show testnets
        if (STAGING_ENV || ENABLE_TESTNET) {
          return isTestnet;
        }

        return !isTestnet;
      })
      .reduce(
        (acc, value) => acc.add(marketsData[value as keyof typeof CustomMarket].chainId),
        new Set<number>()
      )
  );
}

/**
 * selectable markets (markets in a available network + forks when enabled)
 */

export const availableMarkets = Object.keys(marketsData).filter((key) =>
  getSupportedChainIds().includes(marketsData[key as keyof typeof CustomMarket].chainId)
) as CustomMarket[];

const linkBuilder =
  ({ baseUrl, addressPrefix = 'address', txPrefix = 'tx' }: ExplorerLinkBuilderConfig) =>
  ({ tx, address }: ExplorerLinkBuilderProps): string => {
    if (tx) {
      return `${baseUrl}/${txPrefix}/${tx}`;
    }
    if (address) {
      return `${baseUrl}/${addressPrefix}/${address}`;
    }
    return baseUrl;
  };

export function getNetworkConfig(chainId: ChainId): NetworkConfig {
  const config = networkConfigs[chainId];
  if (!config) {
    // this case can only ever occure when a wallet is connected with a unknown chainId which will not allow interaction
    const name = ChainIdToNetwork[chainId];
    return {
      name: name || `unknown chainId: ${chainId}`,
    } as unknown as NetworkConfig;
  }
  return {
    ...config,
    explorerLinkBuilder: linkBuilder({ baseUrl: config.explorerLink }),
  };
}

export const isFeatureEnabled = {
  faucet: (data: MarketDataType) => data.enabledFeatures?.faucet,
  governance: (data: MarketDataType) => data.enabledFeatures?.governance,
  staking: (data: MarketDataType) => data.enabledFeatures?.staking,
  liquiditySwap: (data: MarketDataType) => data.enabledFeatures?.liquiditySwap,
  collateralRepay: (data: MarketDataType) => data.enabledFeatures?.collateralRepay,
  permissions: (data: MarketDataType) => data.enabledFeatures?.permissions,
};

const providers: { [network: string]: ethersProviders.Provider } = {};

/**
 * Created a fallback rpc provider in which providers are prioritized from private to public and in case there are multiple public ones, from top to bottom.
 * @param chainId
 * @returns provider or fallbackprovider in case multiple rpcs are configured
 */
export const getProvider = (chainId: ChainId): ethersProviders.Provider => {
  if (!providers[chainId]) {
    const config = getNetworkConfig(chainId);
    const chainProviders: string[] = [];
    if (config.privateJsonRPCUrl) {
      chainProviders.push(config.privateJsonRPCUrl);
    }
    if (config.publicJsonRPCUrl.length) {
      config.publicJsonRPCUrl.map((rpc) => chainProviders.push(rpc));
    }
    if (!chainProviders.length) {
      throw new Error(`${chainId} has no jsonRPCUrl configured`);
    }
    if (chainProviders.length === 1) {
      providers[chainId] = new StaticJsonRpcProvider(chainProviders[0], chainId);
    } else {
      providers[chainId] = new RotationProvider(chainProviders, chainId);
    }
  }
  return providers[chainId];
};

export const getENSProvider = () => {
  const chainId = 1;
  const config = getNetworkConfig(chainId);
  return new StaticJsonRpcProvider(config.publicJsonRPCUrl[0], chainId);
};

const ammDisableProposal = 'https://app.aave.com/governance/proposal/44';
const ustDisableProposal = 'https://app.aave.com/governance/proposal/75';
const kncDisableProposal = 'https://app.aave.com/governance/proposal/69';
const v2MainnetDisableProposal = 'https://app.aave.com/governance/proposal/111';
const v2MainnetDisableProposal2 = 'https://app.aave.com/governance/proposal/125';
// TODO: Add for production
// const v2PolygonDisableProposal = 'https://app.aave.com/governance/proposal/124';

export const frozenProposalMap: Record<string, string> = {
  ['UST' + CustomMarket.proto_mainnet]: ustDisableProposal,
  ['KNC' + CustomMarket.proto_mainnet]: kncDisableProposal,
  ['UNIDAIUSDC' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIWBTCUSDC' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIDAIWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIUSDCWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIAAVEWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIBATWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNICRVWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNILINKWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIMKRWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIRENWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNISNXWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIUNIWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIWBTCWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['UNIYFIWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['BPTWBTCWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['BPTBALWETH' + CustomMarket.proto_mainnet]: ammDisableProposal,
  ['BAL' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal,
  ['CVX' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal,
  ['REN' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal,
  ['YFI' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['CRV' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['ZRX' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['MANA' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['1INCH' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['BAT' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['SUSD' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['ENJ' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['GUSD' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['AMPL' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['RAI' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['USDP' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['LUSD' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['XSUSHI' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['DPI' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['RENFIL' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['MKR' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['ENS' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['LINK' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['UNI' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  ['SNX' + CustomMarket.proto_mainnet]: v2MainnetDisableProposal2,
  // TODO: Add for production
  // ['BAL' + CustomMarket.proto_polygon]: v2PolygonDisableProposal,
  // ['CRV' + CustomMarket.proto_polygon]: v2PolygonDisableProposal,
  // ['DPI' + CustomMarket.proto_polygon]: v2PolygonDisableProposal,
  // ['GHST' + CustomMarket.proto_polygon]: v2PolygonDisableProposal,
  // ['LINK' + CustomMarket.proto_polygon]: v2PolygonDisableProposal,
  // ['XSUSHI' + CustomMarket.proto_polygon]: v2PolygonDisableProposal,
};

// reexport so we can forbit config import
export { CustomMarket };
export type { MarketDataType, NetworkConfig };
