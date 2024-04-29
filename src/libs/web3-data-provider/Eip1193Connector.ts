/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectedConnector } from '@web3-react/injected-connector';
import { ConnectorUpdate } from '@web3-react/types';

export type SendReturnResult = { result: any };
export type SendReturn = any;

export type Send = (method: string, params?: any[]) => Promise<SendReturnResult | SendReturn>;
export type SendOld = ({ method }: { method: string }) => Promise<SendReturnResult | SendReturn>;
function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn;
}

declare global {
  interface Window {
    ethereum: any;
  }
}

export class Eip1193Connector extends InjectedConnector {
  public async activate(): Promise<ConnectorUpdate> {
    if (!window.ethereum) {
      // throw new NoEthereumProviderError();
    }

    // if (window.ethereum.on) {
    //   window.ethereum.on('chainChanged', this.handleChainChanged);
    //   window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    //   window.ethereum.on('close', this.handleClose);
    //   window.ethereum.on('networkChanged', this.handleNetworkChanged);
    // }

    if ((window.ethereum as any).isMetaMask) {
      (window.ethereum as any).autoRefreshOnNetworkChange = false;
    }

    // try to activate + get account via eth_requestAccounts
    let account;
    try {
      account = await window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((sendReturn: unknown) => sendReturn && parseSendReturn(sendReturn)[0]);
    } catch (error) {
      throw new Error('eth_requestAccounts was unsuccessful');
      // if ((error as any).code === 4001) {
      //   throw new UserRejectedRequestError();
      // }
      // warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable');
    }

    console.log('account', account);
    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      account = await window.ethereum
        .enable()
        .then((sendReturn: unknown) => sendReturn && parseSendReturn(sendReturn)[0]);
    }

    return { provider: window.ethereum, ...(account ? { account } : {}) };
  }

  public async getChainId(): Promise<number | string> {
    // if (!window.ethereum) {
    //   throw new NoEthereumProviderError();
    // }

    console.log('! here !');
    let chainId;
    try {
      chainId = await (window as any).ethereum
        .request({ method: 'eth_chainId' })
        .then((sendReturn: unknown) => Number(sendReturn));
    } catch {
      throw new Error('eth_chainId was unsuccessful, falling back to net_version');
    }

    // if (!chainId) {
    //   try {
    //     chainId = await ((window as any).ethereum.send as Send)('net_version').then(
    //       parseSendReturn
    //     );
    //   } catch {
    //     warning(false, 'net_version was unsuccessful, falling back to net version v2');
    //   }
    // }

    // if (!chainId) {
    //   try {
    //     chainId = parseSendReturn(
    //       ((window as any).ethereum.send as SendOld)({ method: 'net_version' })
    //     );
    //   } catch {
    //     warning(
    //       false,
    //       'net_version v2 was unsuccessful, falling back to manual matches and static properties'
    //     );
    //   }
    // }

    // if (!chainId) {
    //   if ((window.ethereum as any).isDapper) {
    //     chainId = parseSendReturn((window.ethereum as any).cachedResults.net_version);
    //   } else {
    //     chainId =
    //       (window.ethereum as any).chainId ||
    //       (window.ethereum as any).netVersion ||
    //       (window.ethereum as any).networkVersion ||
    //       (window.ethereum as any)._chainId;
    //   }
    // }

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    // if (!window.ethereum) {
    //   throw new NoEthereumProviderError();
    // }

    let account;
    try {
      account = await window.ethereum.request('eth_accounts').then((sendReturn: unknown) => {
        console.log('sendReturn', sendReturn);
        return parseSendReturn(sendReturn)[0];
      });
    } catch {
      throw new Error('eth_accounts was unsuccessful, falling back to enable');
      // warning(false, 'eth_accounts was unsuccessful, falling back to enable');
    }

    // if (!account) {
    //   try {
    //     account = await window.ethereum
    //       .enable()
    //       .then((sendReturn) => parseSendReturn(sendReturn)[0]);
    //   } catch {
    //     warning(false, 'enable was unsuccessful, falling back to eth_accounts v2');
    //   }
    // }

    // if (!account) {
    //   account = parseSendReturn((window.ethereum.send as SendOld)({ method: 'eth_accounts' }))[0];
    // }

    return account;
  }
}
