import { AbstractConnector } from '@web3-react/abstract-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletConnectConnector } from './wallet-connect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { FrameConnector } from '@web3-react/frame-connector';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';

import { MewConnectConnector } from '@myetherwallet/mewconnect-connector';

import { getNetworkConfig } from '../../../helpers/config/markets-and-network-config';
import { ChainId } from '@aave/contract-helpers';

export type AvailableWeb3Connectors =
  | 'browser'
  | 'wallet-connect'
  | 'wallet-link'
  | 'mew-wallet'
  | 'torus'
  | 'gnosis-safe'
  | 'frame';

const POLLING_INTERVAL = 12000;
const APP_NAME = 'Aave';
const APP_LOGO_URL = 'https://aave.com/favicon.ico';

function raiseUnsupportedNetworkError(chainId: ChainId, connectorName: AvailableWeb3Connectors) {
  throw new Error(`ChainId "${chainId}" is not supported by ${connectorName}`);
}

export function getWeb3Connector(
  connectorName: AvailableWeb3Connectors,
  chainId: ChainId,
  supportedChainIds: ChainId[],
): AbstractConnector {
  const networkConfig = getNetworkConfig(chainId);

  switch (connectorName) {
    case 'browser':
      return new InjectedConnector({});
    case 'wallet-link':
      return new WalletLinkConnector({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
        url: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0],
      });
    case 'wallet-connect':
      return new WalletConnectConnector({
        rpc: supportedChainIds.reduce((acc, network) => {
          const config = getNetworkConfig(network);
          acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
          return acc;
        }, {} as { [networkId: number]: string }),
        bridge: 'https://aave.bridge.walletconnect.org',
        qrcode: true,
        pollingInterval: POLLING_INTERVAL,
        preferredNetworkId: chainId,
      });
    case 'mew-wallet':
      return new MewConnectConnector({
        url:
          networkConfig.privateJsonRPCWSUrl ||
          networkConfig.privateJsonRPCUrl ||
          networkConfig.publicJsonRPCWSUrl ||
          networkConfig.publicJsonRPCUrl[0],
        windowClosedError: true,
      });
    case 'torus':
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
    case 'gnosis-safe': {
      return new SafeAppConnector();
    }
    case 'frame': {
      if (chainId !== ChainId.mainnet) {
        raiseUnsupportedNetworkError(chainId, connectorName);
      }
      return new FrameConnector({ supportedChainIds });
    }
    default: {
      throw new Error(`unsupported connector name: ${connectorName}`);
    }
  }
}
export function disconnectWeb3Connector(): void {
  const currentProvider = localStorage.getItem('currentProvider') as
    | AvailableWeb3Connectors
    | undefined;
  switch (currentProvider) {
    case 'wallet-connect': {
      localStorage.removeItem('walletconnect');
      break;
    }
    case 'wallet-link': {
      localStorage.removeItem('__WalletLink__:https://www.walletlink.org:SessionId');
      localStorage.removeItem('__WalletLink__:https://www.walletlink.org:Addresses');
      break;
    }
    case 'torus': {
      localStorage.removeItem('loglevel');
      localStorage.removeItem('loglevel:torus-embed');
      break;
    }
  }
  localStorage.removeItem('currentProvider');
}
