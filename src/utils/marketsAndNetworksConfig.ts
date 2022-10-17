import { ChainId, ChainIdToNetwork } from '@aave/contract-helpers';
import { Network, StaticJsonRpcProvider } from '@ethersproject/providers';
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

export type Pool = {
  address: string;
};

export const STAGING_ENV = process.env.NEXT_PUBLIC_ENV === 'staging';
export const PROD_ENV = !process.env.NEXT_PUBLIC_ENV || process.env.NEXT_PUBLIC_ENV === 'prod';
export const ENABLE_TESTNET =
  PROD_ENV && global?.window?.localStorage.getItem('testnetsEnabled') === 'true';

// determines if forks should be shown
const FORK_ENABLED = global?.window?.localStorage.getItem('forkEnabled') === 'true';
// specifies which network was forked
const FORK_BASE_CHAIN_ID = Number(global?.window?.localStorage.getItem('forkBaseChainId') || 1);
// specifies on which chainId the fork is running
const FORK_CHAIN_ID = Number(global?.window?.localStorage.getItem('forkNetworkId') || 3030);
const FORK_RPC_URL = global?.window?.localStorage.getItem('forkRPCUrl') || 'http://127.0.0.1:8545';
const FORK_WS_RPC_URL =
  global?.window?.localStorage.getItem('forkWsRPCUrl') || 'ws://127.0.0.1:8545';

/**
 * Generates network configs based on networkConfigs & fork settings.
 * Forks will have a rpcOnly clone of their underlying base network config.
 */
export const networkConfigs = Object.keys(_networkConfigs).reduce((acc, value) => {
  acc[value] = _networkConfigs[value];
  if (FORK_ENABLED && Number(value) === FORK_BASE_CHAIN_ID) {
    acc[FORK_CHAIN_ID] = {
      ..._networkConfigs[value],
      // rpcOnly: true,
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
      rpcOnly: true,
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
// Unused for now, need to debug why batch providers are incompatible with tenderly rpcs for fork/testing usage
class StaticJsonRpcBatchProvider extends ethersProviders.JsonRpcBatchProvider {
  async detectNetwork(): Promise<Network> {
    let network = this.network;
    if (network == null) {
      network = await super.detectNetwork();

      if (!network) {
        logger.throwError('no network detected', Logger.errors.UNKNOWN_ERROR, {});
      }

      // If still not set, set it
      if (this._network == null) {
        // A static network does not support "any"
        defineReadOnly(this, '_network', network);

        this.emit('network', network, null);
      }
    }
    return network;
  }
} */

interface RotationProviderConfig {
  rotationDelay?: number;
  fallFowardDelay?: number;
}
/**
 * The provider will rotate rpcs on error.
 * If provider rotates away from the first RPC, rotate back after a set interval to prioritize using most reliable RPC.
 * If provider rotates through all rpcs, delay to avoid spamming rpcs with requests.
 */

const DEFAULT_ROTATION_DELAY = 5000;
const DEFAULT_FALL_FORWARD_DELAY = 60000;

export class RotationProvider extends ethersProviders.BaseProvider {
  readonly providers: StaticJsonRpcProvider[];
  private currentProviderIndex = 0;
  private firstRotationTimestamp = 0;
  // after completing a full rotation of the RotationProvider, delay to avoid spamming rpcs with requests
  private rotationDelay: number;
  // if we rotate away from first rpc, return back after this delay
  private fallForwardDelay: number;

  constructor(urls: string[], chainId: number, config?: RotationProviderConfig) {
    super(chainId);
    this.providers = urls.map((url) => new StaticJsonRpcProvider(url, chainId));

    this.rotationDelay = config?.rotationDelay || DEFAULT_ROTATION_DELAY;
    this.fallForwardDelay = config?.fallFowardDelay || DEFAULT_FALL_FORWARD_DELAY;
  }

  /**
   * If we rotate away from the first RPC, rotate back after a set interval to prioritize using most reliable RPC
   */
  async fallForwardRotation() {
    const now = new Date().getTime();
    const diff = now - this.firstRotationTimestamp;
    if (diff < this.fallForwardDelay) {
      await sleep(this.fallForwardDelay - diff);
      this.currentProviderIndex = 0;
    }
  }

  /**
   * If rpc fails, rotate to next available and trigger rotation or fall forward delay where applicable
   * @param prevIndex last updated index, checked to avoid having multiple active rotations
   */
  private async rotateUrl(prevIndex: number) {
    // don't rotate when another rotation was already triggered
    if (prevIndex !== this.currentProviderIndex) return;
    // if we rotate away from the first url, switch back after FALL_FORWARD_DELAY
    if (this.currentProviderIndex === 0) {
      this.currentProviderIndex += 1;
      this.firstRotationTimestamp = new Date().getTime();
      this.fallForwardRotation();
    } else if (this.currentProviderIndex === this.providers.length - 1) {
      await sleep(this.rotationDelay);
      this.currentProviderIndex = 0;
    } else {
      this.currentProviderIndex += 1;
    }
  }

  async detectNetwork(): Promise<Network> {
    const index = this.currentProviderIndex;
    try {
      return await this.providers[index].detectNetwork();
    } catch (e) {
      console.error(e.message);
      await this.rotateUrl(index);
      return this.detectNetwork();
    }
  }

  // eslint-disable-next-line
  async send(method: string, params: Array<any>): Promise<any> {
    const index = this.currentProviderIndex;
    try {
      return await this.providers[index].send(method, params);
    } catch (e) {
      console.error(e.message);
      await this.rotateUrl(index);
      return this.send(method, params);
    }
  }

  // eslint-disable-next-line
  async perform(method: string, params: any): Promise<any> {
    const index = this.currentProviderIndex;
    try {
      console.log(`calling perform on provider ${index}`);
      return await this.providers[index].perform(method, params);
    } catch (e) {
      console.error(e.message);
      this.emit('debug', {
        action: 'perform',
        provider: this.providers[index],
        error: e,
      });
      await this.rotateUrl(index);
      return await this.perform(method, params);
    }
  }
}

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

const ammDisableProposal = 'https://app.aave.com/governance/proposal/?proposalId=44';

export const frozenProposalMap: Record<string, string> = {
  ['UST']: 'https://app.aave.com/governance/proposal/?proposalId=75',
  ['KNC']: 'https://app.aave.com/governance/proposal/?proposalId=69',
  ['UNIDAIUSDC']: ammDisableProposal,
  ['UNIWBTCUSDC']: ammDisableProposal,
  ['UNIDAIWETH']: ammDisableProposal,
  ['UNIUSDCWETH']: ammDisableProposal,
  ['UNIAAVEWETH']: ammDisableProposal,
  ['UNIBATWETH']: ammDisableProposal,
  ['UNICRVWETH']: ammDisableProposal,
  ['UNILINKWETH']: ammDisableProposal,
  ['UNIMKRWETH']: ammDisableProposal,
  ['UNIRENWETH']: ammDisableProposal,
  ['UNISNXWETH']: ammDisableProposal,
  ['UNIUNIWETH']: ammDisableProposal,
  ['UNIWBTCWETH']: ammDisableProposal,
  ['UNIYFIWETH']: ammDisableProposal,
  ['BPTWBTCWETH']: ammDisableProposal,
  ['BPTBALWETH']: ammDisableProposal,
};

// reexport so we can forbit config import
export { CustomMarket };
export type { MarketDataType, NetworkConfig };
