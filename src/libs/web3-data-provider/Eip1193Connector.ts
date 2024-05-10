/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractConnector } from '@web3-react/abstract-connector';
import { NoEthereumProviderError, UserRejectedRequestError } from '@web3-react/injected-connector';
import {
  Send,
  SendOld,
  SendReturn,
  SendReturnResult,
} from '@web3-react/injected-connector/dist/types';
import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';

function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn;
}

export class Eip1193Connector extends AbstractConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    // this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  private handleChainChanged(chainId: string | number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.emitUpdate({ chainId: Number(chainId).toString(), provider: (window as any).ethereum });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  private handleClose(): void {
    this.emitDeactivate();
  }

  // private handleNetworkChanged(networkId: string | number): void {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   this.emitUpdate({ chainId: networkId, provider: (window as any).ethereum });
  // }

  public async activate(): Promise<ConnectorUpdate> {
    if (!(window as any).ethereum) {
      throw new NoEthereumProviderError();
    }

    if ((window as any).ethereum.on) {
      (window as any).ethereum.on('chainChanged', this.handleChainChanged);
      (window as any).ethereum.on('accountsChanged', this.handleAccountsChanged);
      (window as any).ethereum.on('close', this.handleClose);
      // (window as any).ethereum.on('networkChanged', this.handleNetworkChanged);
    }

    if (((window as any).ethereum as any).isMetaMask) {
      ((window as any).ethereum as any).autoRefreshOnNetworkChange = false;
    }

    // try to activate + get account via eth_requestAccounts
    let account;
    try {
      account = await ((window as any).ethereum.send as Send)('eth_requestAccounts').then(
        (sendReturn) => parseSendReturn(sendReturn)[0]
      );
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError();
      }
    }

    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      account = await (window as any).ethereum
        .enable()
        .then((sendReturn: any) => sendReturn && parseSendReturn(sendReturn)[0]);
    }

    return { provider: (window as any).ethereum, ...(account ? { account } : {}) };
  }

  public async getProvider(): Promise<any> {
    return (window as any).ethereum;
  }

  public async getChainId(): Promise<number | string> {
    if (!(window as any).ethereum) {
      throw new NoEthereumProviderError();
    }

    let chainId;
    try {
      chainId = await ((window as any).ethereum.send as Send)('eth_chainId').then(parseSendReturn);
    } catch {
      console.error('eth_chainId was unsuccessful, falling back to net_version');
    }

    if (!chainId) {
      try {
        chainId = await ((window as any).ethereum.send as Send)('net_version').then(
          parseSendReturn
        );
      } catch {
        console.error('net_version was unsuccessful, falling back to net version v2');
      }
    }

    if (!chainId) {
      try {
        chainId = parseSendReturn(
          ((window as any).ethereum.send as SendOld)({ method: 'net_version' })
        );
      } catch {
        console.error(
          'net_version v2 was unsuccessful, falling back to manual matches and static properties'
        );
      }
    }

    if (!chainId) {
      if (((window as any).ethereum as any).isDapper) {
        chainId = parseSendReturn(((window as any).ethereum as any).cachedResults.net_version);
      } else {
        chainId =
          ((window as any).ethereum as any).chainId ||
          ((window as any).ethereum as any).netVersion ||
          ((window as any).ethereum as any).networkVersion ||
          ((window as any).ethereum as any)._chainId;
      }
    }

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!(window as any).ethereum) {
      throw new NoEthereumProviderError();
    }

    let account;
    try {
      account = await ((window as any).ethereum.send as Send)('eth_accounts').then(
        (sendReturn) => parseSendReturn(sendReturn)[0]
      );
    } catch {
      console.error('eth_accounts was unsuccessful, falling back to enable');
    }

    if (!account) {
      try {
        account = await (window as any).ethereum
          .enable()
          .then((sendReturn: any) => parseSendReturn(sendReturn)[0]);
      } catch {
        console.error('enable was unsuccessful, falling back to eth_accounts v2');
      }
    }

    if (!account) {
      account = parseSendReturn(
        ((window as any).ethereum.send as SendOld)({ method: 'eth_accounts' })
      )[0];
    }

    return account;
  }

  public deactivate() {
    if ((window as any).ethereum && (window as any).ethereum.removeListener) {
      (window as any).ethereum.removeListener('chainChanged', this.handleChainChanged);
      (window as any).ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
      (window as any).ethereum.removeListener('close', this.handleClose);
      // (window as any).ethereum.removeListener('networkChanged', this.handleNetworkChanged);
    }
  }

  public async isAuthorized(): Promise<boolean> {
    if (!(window as any).ethereum) {
      return false;
    }

    try {
      return await ((window as any).ethereum.send as Send)('eth_accounts').then((sendReturn) => {
        if (parseSendReturn(sendReturn).length > 0) {
          return true;
        } else {
          return false;
        }
      });
    } catch {
      return false;
    }
  }
}
