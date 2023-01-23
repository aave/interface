import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';

interface TrustWalletConnectorArguments {
  supportedChainIds?: number[];
}

interface WindowEthereum extends Window {
  ethereum?: WindowEthereumTrust;
  trustWallet?: WindowEthereumTrust;
}

type WindowEthereumTrust = WindowEthereum & {
  isTrust?: boolean;
  providers?: Array<WindowEthereumTrust>;
  request: (...args: unknown[]) => Promise<string[]>;
  addListener: (...args: unknown[]) => void;
  removeListener: (...args: unknown[]) => void;
  chainId: number;
};

export function getTrustWalletInjectedProvider(): WindowEthereum['ethereum'] | undefined {
  const isTrustWallet = (ethereum?: WindowEthereumTrust['ethereum']) => {
    // Identify if Trust Wallet injected provider is present.
    const trustWallet = !!ethereum?.isTrust;

    return trustWallet;
  };

  const ethereum = (window as WindowEthereum).ethereum;

  const injectedProviderExist = typeof window !== 'undefined' && typeof ethereum !== 'undefined';

  // No injected providers exist.
  if (!injectedProviderExist) {
    return;
  }

  // Trust Wallet was injected into window.ethereum.
  if (isTrustWallet(ethereum)) {
    return ethereum;
  }

  // Trust Wallet provider might be replaced by another
  // injected provider, check the providers array.
  if (ethereum?.providers) {
    return ethereum.providers.find(isTrustWallet);
  }

  // In some cases injected providers can replace window.ethereum
  // without updating the providers array. In those instances the Trust Wallet
  // can be installed and its provider instance can be retrieved by
  // looking at the global `trustwallet` object.
  return (window as WindowEthereum).trustWallet;
}

export class TrustWalletConnector extends AbstractConnector {
  private provider: WindowEthereum['ethereum'];

  constructor({ supportedChainIds }: TrustWalletConnectorArguments) {
    super({ supportedChainIds });

    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  public async activate(): Promise<ConnectorUpdate> {
    this.provider = getTrustWalletInjectedProvider();

    const accounts = await this.provider?.request({
      method: 'eth_requestAccounts',
    });

    const account = accounts?.[0];

    this.provider?.addListener('chainChanged', this.handleChainChanged);
    this.provider?.addListener('accountsChanged', this.handleAccountsChanged);
    this.provider?.addListener('disconnect', this.handleDisconnect);

    return { provider: this.provider, account: account };
  }

  public async getProvider(): Promise<WindowEthereum['ethereum']> {
    return this.provider;
  }

  public async getChainId(): Promise<number> {
    return this.provider?.chainId ?? 1;
  }

  public async getAccount(): Promise<null | string> {
    const accounts = await this.provider?.request({
      method: 'eth_requestAccounts',
    });
    return accounts?.[0] ?? null;
  }

  public deactivate(): void {
    this.provider?.removeListener('chainChanged', this.handleChainChanged);
    this.provider?.removeListener('accountsChanged', this.handleAccountsChanged);
    this.provider?.removeListener('disconnect', this.handleDisconnect);
  }

  public async close(): Promise<void> {
    this.emitDeactivate();
  }

  private handleChainChanged(chainId: number | string): void {
    this.emitUpdate({ chainId: chainId });
  }

  private handleDisconnect() {
    this.close();
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.close();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }
}
