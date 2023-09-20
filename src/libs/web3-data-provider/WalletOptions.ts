import { ChainId } from '@aave/contract-helpers';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { Connector, mainnet } from 'wagmi';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { LedgerConnector } from 'wagmi/connectors/ledger';
import { SafeConnector } from 'wagmi/connectors/safe';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

export enum WalletType {
  INJECTED = 'injected',
  WALLET_CONNECT = 'wallet_connect',
  WALLET_LINK = 'wallet_link',
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
export class ReadOnlyModeConnector {
  readAddress = '';

  activate() {
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

export const getWallet = (
  wallet: WalletType,
  chainId: ChainId = ChainId.mainnet,
  currentChainId: ChainId = ChainId.mainnet
): Connector => {
  switch (wallet) {
    case WalletType.LEDGER:
      return new LedgerConnector({ options: {} });
    case WalletType.INJECTED:
      return new InjectedConnector();
    case WalletType.WALLET_LINK:
      const networkConfig = getNetworkConfig(chainId);
      return new CoinbaseWalletConnector({
        options: {
          appName: APP_NAME,
          appLogoUrl: APP_LOGO_URL,
          jsonRpcUrl: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0],
        },
      });
    case WalletType.WALLET_CONNECT:
      return new WalletConnectConnector({
        chains: [mainnet],
        options: {
          showQrModal: true,
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
        },
      });
    case WalletType.GNOSIS:
      if (window) {
        return new SafeConnector({ options: {} });
      }
      throw new Error('Safe app not working');
    default: {
      throw new Error(`unsupported wallet`);
    }
  }
};
