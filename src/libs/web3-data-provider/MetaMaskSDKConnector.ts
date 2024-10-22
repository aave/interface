/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  MetaMaskSDK as _MetaMaskSDK,
  MetaMaskSDKOptions as _MetaMaskSDKOptions,
  SDKProvider,
} from '@metamask/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';

type Address = string;

/**
 * MetaMaskSDK options.
 */
export type MetaMaskSDKConnectorOptions = Pick<
  _MetaMaskSDKOptions,
  'infuraAPIKey' | 'readonlyRPCMap' | 'headless'
> & {
  dappMetadata: Pick<_MetaMaskSDKOptions['dappMetadata'], 'name' | 'url' | 'iconUrl'>;
  supportedChainIds?: number[];
};

/**
 * Listener type for MetaMaskSDK events.
 */
type Listener = Parameters<AbstractConnector['on']>[1];

/**
 * Error thrown when the MetaMaskSDK is not installed.
 */
export class NoMetaMaskSDKError extends Error {
  public constructor() {
    super('MetaMaskSDK not installed');
    this.name = NoMetaMaskSDKError.name;
    Object.setPrototypeOf(this, NoMetaMaskSDKError.prototype);
  }
}

/**
 * Parses a chainId from a string or number.
 */
function parseChainId(chainId: string | number) {
  return typeof chainId === 'number'
    ? chainId
    : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
}

/**
 * MetaMask SDK Connector
 */
export class MetaMaskSDKConnector extends AbstractConnector {
  private readonly options: Omit<MetaMaskSDKConnectorOptions, 'supportedChainIds'>;

  public sdk: _MetaMaskSDK | undefined;
  private provider: SDKProvider | undefined;

  constructor({ supportedChainIds, ...options }: MetaMaskSDKConnectorOptions) {
    super({ supportedChainIds: supportedChainIds });

    const defaultUrl =
      typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';

    this.options = {
      ...options,
      dappMetadata: options?.dappMetadata ?? {
        url: defaultUrl,
        name: defaultUrl !== '' ? undefined : 'web3-react',
      },
    };

    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.onChainChanged = this.onChainChanged.bind(this);
    this.onAccountsChanged = this.onAccountsChanged.bind(this);
  }

  /**
   * Indicates whether the user is connected to the MetaMaskSDK.
   */
  public async isConnected() {
    try {
      if (this.provider?.isConnected?.() === true) {
        if (this.sdk?.isExtensionActive() === true) {
          const accounts = await this.getAccounts();
          return accounts.length > 0;
        }

        return true;
      }
    } catch {
      // ignore
    }

    return false;
  }

  /**
   * Activate
   */
  public async activate(): Promise<ConnectorUpdate> {
    if (this.sdk && this.provider) {
      const isConnected = await this.isConnected();

      if (!isConnected) {
        await this.sdk.connect();
      }

      return { provider: this.provider, account: await this.getAccount() };
    }

    const MetaMaskSDK = await import('@metamask/sdk').then((m) => m?.default ?? m);
    this.sdk = new MetaMaskSDK({
      _source: 'web3-react',
      useDeeplink: true,
      injectProvider: false,
      forceInjectProvider: false,
      forceDeleteProvider: false,
      ...this.options,
    });

    await this.sdk.init();

    this.provider = this.sdk.getProvider()!;

    if (!this.provider) return {};

    this.provider.on('connect', this.onConnect as Listener);
    this.provider.on('disconnect', this.onDisconnect as Listener);
    this.provider.on('chainChanged', this.onChainChanged as Listener);
    this.provider.on('accountsChanged', this.onAccountsChanged as Listener);

    return await this.activate();
  }

  /**
   * Get MetaMask Provider
   */
  public async getProvider(): Promise<SDKProvider> {
    if (!this.provider) throw new NoMetaMaskSDKError();

    return this.provider;
  }

  /**
   * Get chain id
   */
  public async getChainId(): Promise<number> {
    const provider = await this.getProvider();
    const chainId =
      provider.getChainId() ?? (await provider?.request<string>({ method: 'eth_chainId' }));

    return parseChainId(chainId);
  }

  /**
   * Get selected account
   */
  public async getAccount(): Promise<null | Address> {
    const accounts = await this.getAccounts();

    return accounts?.[0] ?? null;
  }

  /**
   * Get selected accounts
   */
  public async getAccounts(): Promise<Address[]> {
    if (!this.provider) {
      return [];
    }

    const accounts = (await this.provider.request<Address[]>({
      method: 'eth_accounts',
    })) as Address[];

    return accounts ?? [];
  }

  /**
   * Deactivate this provider instance, without closing the connection
   */
  public deactivate() {
    if (!this.provider) {
      return;
    }

    this.provider.removeListener('connect', this.onConnect);
    this.provider.removeListener('disconnect', this.onDisconnect);
    this.provider.removeListener('chainChanged', this.onChainChanged);
    this.provider.removeListener('accountsChanged', this.onAccountsChanged);
  }

  /**
   * Close
   */
  public async close() {
    this.sdk?.terminate();
    this.emitDeactivate();
  }

  /**
   * On connect event handler
   */
  private onConnect({ chainId }: { chainId: number | string }): void {
    this.emitUpdate({ chainId: parseChainId(chainId) });
  }

  /**
   * On disconnect event handler
   */
  private async onDisconnect(error: any): Promise<void> {
    const originalError = (error.data as any)?.originalError ?? error;

    // If MetaMask emits a `code: 1013` error, wait for reconnection before disconnecting
    // https://github.com/MetaMask/providers/pull/120
    if (error && originalError.code === 1013 && this.provider) {
      const accounts = await this.provider.request<Address[]>({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) return;
    }

    this.clearCache();

    if (error) {
      this.emitError(error);
    }

    // this.emitUpdate({ provider: null, account: null })
  }

  /**
   * On chainChanged event handler
   */
  private onChainChanged(chainId: string): void {
    this.emitUpdate({ chainId: parseChainId(chainId) });
  }

  /**
   * On accountsChanged event handler
   */
  private onAccountsChanged(accounts: string[]): void {
    // Disconnect if there are no accounts
    if (accounts.length === 0) {
      // ... and using browser extension
      if (this.sdk?.isExtensionActive()) this.close();
      // FIXME(upstream): Mobile app sometimes emits invalid `accountsChanged` event with empty accounts array
      else return;
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  /**
   * Is application authorized
   */
  public async isAuthorized() {
    try {
      const accounts = await this.getAccounts();

      return accounts && accounts.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Clears the cache.
   */
  private clearCache() {
    localStorage.removeItem('.MMSDK_cached_address');
    localStorage.removeItem('.MMSDK_cached_chainId');
    localStorage.removeItem('.sdk-comm');
    localStorage.removeItem('.MetaMaskSDKLng');
  }
}
