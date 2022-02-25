import { ChainId } from '@aave/contract-helpers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { FrameConnector } from '@web3-react/frame-connector';
import { getNetworkConfig, getSupportedChainIds } from 'src/utils/marketsAndNetworksConfig';

export enum WalletType {
  INJECTED,
  METAMASK,
  WALLET_CONNECT,
  WALLET_LINK,
  MEW_WALLET,
  TORUS,
  GNOSIS_SAFE,
  FRAME,
}

const POLLING_INTERVAL = 12000;
const APP_NAME = 'Aave';
const APP_LOGO_URL = 'https://aave.com/favicon.ico';

const supportedChainIds = getSupportedChainIds();

export const injected = new InjectedConnector({ supportedChainIds });

export const getWallet = (wallet: WalletType, chainId: ChainId): AbstractConnector => {
  const supportedChainIds = getSupportedChainIds();

  switch (wallet) {
    case WalletType.INJECTED:
      return new InjectedConnector({ supportedChainIds });
    case WalletType.WALLET_LINK:
      const networkConfig = getNetworkConfig(chainId);
      return new WalletLinkConnector({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
        url: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0],
      });
    case WalletType.WALLET_CONNECT:
      return new WalletConnectConnector({
        rpc: supportedChainIds.reduce((acc, network) => {
          const config = getNetworkConfig(network);
          acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
          return acc;
        }, {} as { [networkId: number]: string }),
        bridge: 'https://aave.bridge.walletconnect.org',
        qrcode: true,
        // pollingInterval: POLLING_INTERVAL,
        // preferredNetworkId: chainId,
      });
    // case WalletType.MEW_WALLET:
    //   return new MewConnectConnector({
    //     url:
    //       networkConfig.privateJsonRPCWSUrl ||
    //       networkConfig.privateJsonRPCUrl ||
    //       networkConfig.publicJsonRPCWSUrl ||
    //       networkConfig.publicJsonRPCUrl[0],
    //     windowClosedError: true,
    //   });
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
    // case WalletType.GNOSIS_SAFE: {
    //   return new SafeAppConnector();
    // }
    case WalletType.FRAME: {
      if (chainId !== ChainId.mainnet) {
        throw new Error('Frame cant connect to this network');
      }
      return new FrameConnector({ supportedChainIds });
    }
    default: {
      throw new Error(`unsupported wallet`);
    }
  }
};
