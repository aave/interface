import { ChainId } from '@aave/contract-helpers';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError } from '@web3-react/core';
import { FrameConnector } from '@web3-react/frame-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { ConnectorUpdate } from '@web3-react/types';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

// import { LedgerHQFrameConnector } from 'web3-ledgerhq-frame-connector';
import { WalletConnectConnector } from './WalletConnectConnector';

export enum WalletType {
  INJECTED = 'injected',
  WALLET_CONNECT = 'wallet_connect',
  WALLET_LINK = 'wallet_link',
  TORUS = 'torus',
  FRAME = 'frame',
  GNOSIS = 'gnosis',
  LEDGER = 'ledger',
  READ_ONLY_MODE = 'read_only_mode',
}

const APP_NAME = 'Aave';
const APP_LOGO_URL = 'https://aave.com/favicon.ico';

const mockProvider = {
  request: Promise.resolve(null),
};

/**
 *  This is a connector to be used in read-only mode.
 *  On activate, the connector expects a local storage item called `readOnlyModeAddress` to be set, otherwise an error is thrown.
 *  When the connector is deactivated (i.e. on disconnect, switching wallets), the local storage item is removed.
 */
export class ReadOnlyModeConnector extends AbstractConnector {
  readAddress = '';

  activate(): Promise<ConnectorUpdate<string | number>> {
    const address = localStorage.getItem('readOnlyModeAddress');
    if (!address || address === 'undefined') {
      throw new Error('No address found in local storage for read-only mode');
    }

    this.readAddress = address;

    return Promise.resolve({
      provider: mockProvider,
      chainId: ChainId.mainnet,
      account: this.readAddress,
    });
  }
  getProvider(): Promise<unknown> {
    return Promise.resolve(mockProvider);
  }
  getChainId(): Promise<string | number> {
    return Promise.resolve(ChainId.mainnet);
  }
  getAccount(): Promise<string | null> {
    return Promise.resolve(this.readAddress);
  }
  deactivate(): void {
    const storedReadAddress = localStorage.getItem('readOnlyModeAddress');
    if (storedReadAddress === this.readAddress) {
      // Only update local storage if the address is the same as the one this connector stored.
      // This will be different if the user switches to another account to observe because
      // the new connector gets initialized before this one is deactivated.
      localStorage.removeItem('readOnlyModeAddress');
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
//   return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn;
// }

// export class FamilyConnector extends AbstractConnector {
//   constructor(kwargs: AbstractConnectorArguments) {
//     super(kwargs);

//     this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
//     this.handleChainChanged = this.handleChainChanged.bind(this);
//     this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
//     this.handleClose = this.handleClose.bind(this);
//   }

//   private handleChainChanged(chainId: string | number): void {
//     this.emitUpdate({ chainId, provider: window.ethereum });
//   }

//   private handleAccountsChanged(accounts: string[]): void {
//     if (accounts.length === 0) {
//       this.emitDeactivate();
//     } else {
//       this.emitUpdate({ account: accounts[0] });
//     }
//   }

//   private handleClose(code: number, reason: string): void {
//     this.emitDeactivate();
//   }

//   private handleNetworkChanged(networkId: string | number): void {
//     console.log('herherherhehrer');
//     this.emitUpdate({ chainId: networkId, provider: window.ethereum });
//   }

//   public async activate(): Promise<ConnectorUpdate> {
//     if (!window.ethereum) {
//       throw new NoEthereumProviderError();
//     }

//     if (window.ethereum.on) {
//       window.ethereum.on('chainChanged', this.handleChainChanged);
//       window.ethereum.on('accountsChanged', this.handleAccountsChanged);
//       window.ethereum.on('close', this.handleClose);
//       window.ethereum.on('networkChanged', this.handleNetworkChanged);
//     }

//     if (window.ethereum.isMetaMask) {
//       window.ethereum.autoRefreshOnNetworkChange = false;
//     }

//     // try to activate + get account via eth_requestAccounts
//     let account;
//     try {
//       account = await (window.ethereum.send as Send)('eth_requestAccounts').then(
//         (sendReturn) => parseSendReturn(sendReturn)[0]
//       );
//     } catch (error) {
//       if ((error as any).code === 4001) {
//         throw new UserRejectedRequestError();
//       }
//       // warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable');
//     }

//     // if unsuccessful, try enable
//     if (!account) {
//       // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
//       account = await window.ethereum
//         .enable()
//         .then((sendReturn) => sendReturn && parseSendReturn(sendReturn)[0]);
//     }

//     return { provider: window.ethereum, ...(account ? { account } : {}) };
//   }

//   public async getProvider(): Promise<any> {
//     return window.ethereum;
//   }

//   public async getChainId(): Promise<number | string> {
//     if (!window.ethereum) {
//       throw new NoEthereumProviderError();
//     }

//     let chainId;
//     try {
//       chainId = await (window.ethereum.send as Send)('eth_chainId').then(parseSendReturn);
//     } catch {
//       // warning(false, 'eth_chainId was unsuccessful, falling back to net_version');
//     }

//     if (!chainId) {
//       try {
//         chainId = await (window.ethereum.send as Send)('net_version').then(parseSendReturn);
//       } catch {
//         // warning(false, 'net_version was unsuccessful, falling back to net version v2');
//       }
//     }

//     if (!chainId) {
//       try {
//         chainId = parseSendReturn((window.ethereum.send as SendOld)({ method: 'net_version' }));
//       } catch {
//         // warning(
//         //   false,
//         //   'net_version v2 was unsuccessful, falling back to manual matches and static properties'
//         // );
//       }
//     }

//     if (!chainId) {
//       if ((window.ethereum as any).isDapper) {
//         chainId = parseSendReturn((window.ethereum as any).cachedResults.net_version);
//       } else {
//         chainId =
//           (window.ethereum as any).chainId ||
//           (window.ethereum as any).netVersion ||
//           (window.ethereum as any).networkVersion ||
//           (window.ethereum as any)._chainId;
//       }
//     }

//     return chainId;
//   }

//   public async getAccount(): Promise<null | string> {
//     if (!window.ethereum) {
//       throw new NoEthereumProviderError();
//     }

//     let account;
//     try {
//       account = await (window.ethereum.send as Send)('eth_accounts').then(
//         (sendReturn) => parseSendReturn(sendReturn)[0]
//       );
//     } catch {
//       // warning(false, 'eth_accounts was unsuccessful, falling back to enable');
//     }

//     if (!account) {
//       try {
//         account = await window.ethereum
//           .enable()
//           .then((sendReturn) => parseSendReturn(sendReturn)[0]);
//       } catch {
//         // warning(false, 'enable was unsuccessful, falling back to eth_accounts v2');
//       }
//     }

//     if (!account) {
//       account = parseSendReturn((window.ethereum.send as SendOld)({ method: 'eth_accounts' }))[0];
//     }

//     return account;
//   }

//   public deactivate() {
//     if (window.ethereum && window.ethereum.removeListener) {
//       window.ethereum.removeListener('chainChanged', this.handleChainChanged);
//       window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
//       window.ethereum.removeListener('close', this.handleClose);
//       window.ethereum.removeListener('networkChanged', this.handleNetworkChanged);
//     }
//   }

//   public async isAuthorized(): Promise<boolean> {
//     if (!window.ethereum) {
//       return false;
//     }

//     try {
//       return await (window.ethereum.send as Send)('eth_accounts').then((sendReturn) => {
//         if (parseSendReturn(sendReturn).length > 0) {
//           return true;
//         } else {
//           return false;
//         }
//       });
//     } catch {
//       return false;
//     }
//   }
// }
// export class CustomInjectedConnector extends InjectedConnector {
//   constructor(args: AbstractConnectorArguments) {
//     super(args);

//     // this.handleChainChanged = this.handleChainChanged.bind(this);
//   }

//   handleChainChanged(chainId: string | number): void {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     this.emitUpdate({ chainId, provider: (window as any).ethereum });
//   }
// }

export const getWallet = (
  wallet: WalletType,
  chainId: ChainId = ChainId.mainnet,
  currentChainId: ChainId = ChainId.mainnet
): AbstractConnector => {
  switch (wallet) {
    case WalletType.READ_ONLY_MODE:
      return new ReadOnlyModeConnector();
    // case WalletType.LEDGER:
    //   return new LedgerHQFrameConnector({});
    case WalletType.INJECTED:
      return new InjectedConnector({});
    case WalletType.WALLET_LINK:
      const networkConfig = getNetworkConfig(chainId);
      return new WalletLinkConnector({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
        url: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0],
      });
    case WalletType.WALLET_CONNECT:
      return new WalletConnectConnector(currentChainId);
    case WalletType.GNOSIS:
      if (window) {
        return new SafeAppConnector();
      }
      throw new Error('Safe app not working');
    case WalletType.TORUS:
      return new TorusConnector({
        chainId,
        initOptions: {
          network: {
            host: chainId === ChainId.polygon ? 'matic' : chainId,
          },
          showTorusButton: false,
          enableLogging: false,
          enabledVerifiers: false,
        },
      });
    case WalletType.FRAME: {
      if (chainId !== ChainId.mainnet) {
        throw new UnsupportedChainIdError(chainId, [1]);
      }
      return new FrameConnector({ supportedChainIds: [1] });
    }
    default: {
      throw new Error(`unsupported wallet`);
    }
  }
};
