import {
  EthereumProvider,
  EthereumProviderOptions,
} from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';
import { getNetworkConfig, getSupportedChainIds } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

export const URI_AVAILABLE = 'URI_AVAILABLE';

export class UserRejectedRequestError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = 'The user rejected the request.';
  }
}

export class WalletConnectConnector extends AbstractConnector {
  private readonly config: EthereumProviderOptions;

  public walletConnectProvider?: EthereumProvider;

  constructor() {
    super();

    const supportedChainIds = getSupportedChainIds();
    const [mainnet, ...optionalChains] = supportedChainIds;

    const rpcMap = supportedChainIds.reduce((acc, network) => {
      const config = getNetworkConfig(network);
      acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
      return acc;
    }, {} as { [networkId: number]: string });

    this.config = {
      chains: [mainnet],
      optionalChains,
      rpcMap,
      projectId: '686adbae41fe74595dc2bc1df829fcfe',
      showQrModal: true,
    };

    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  private handleChainChanged(chainId: number | string): void {
    this.emitUpdate({ chainId });
  }

  private handleAccountsChanged(accounts: string[]): void {
    this.emitUpdate({ account: accounts[0] });
  }

  private handleDisconnect(): void {
    this.emitDeactivate();
  }

  private handleDisplayURI = (uri: string): void => {
    console.log(uri);
    this.emit(URI_AVAILABLE, uri);
  };

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.walletConnectProvider) {
      const walletConnectProviderFactory = await import('@walletconnect/ethereum-provider').then(
        (m) => m?.default ?? m
      );
      this.walletConnectProvider = await walletConnectProviderFactory.init(this.config);
    }

    this.walletConnectProvider.on('chainChanged', this.handleChainChanged);
    this.walletConnectProvider.on('accountsChanged', this.handleAccountsChanged);
    this.walletConnectProvider.on('disconnect', this.handleDisconnect);
    this.walletConnectProvider.on('display_uri', this.handleDisplayURI);
    try {
      const accounts = await this.walletConnectProvider.enable();
      const defaultAccount = accounts[0];
      return { provider: this.walletConnectProvider, account: defaultAccount };
    } catch (error) {
      if (error.message === 'User closed modal') {
        throw new UserRejectedRequestError();
      }
      throw error;
    }
  }

  public async getProvider(): Promise<typeof this.walletConnectProvider> {
    return this.walletConnectProvider;
  }

  public async getChainId(): Promise<number | string> {
    invariant(
      this.walletConnectProvider,
      'WalletConnectProvider should exists when calling getChainId'
    );
    return Promise.resolve(this.walletConnectProvider.chainId);
  }

  public async getAccount(): Promise<null | string> {
    invariant(
      this.walletConnectProvider,
      'WalletConnectProvider should exists when calling getAccount'
    );
    return Promise.resolve(this.walletConnectProvider.accounts).then(
      (accounts: string[]): string => accounts[0]
    );
  }

  public deactivate() {
    if (this.walletConnectProvider) {
      this.walletConnectProvider.removeListener('disconnect', this.handleDisconnect);
      this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged);
      this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged);
      this.walletConnectProvider.removeListener('display_uri', this.handleDisplayURI);
      this.walletConnectProvider.disconnect();

      this.walletConnectProvider = undefined;
      localStorage.removeItem('walletProvider');
    }
  }

  public async close() {
    this.emitDeactivate();
  }
}
