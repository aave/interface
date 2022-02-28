import { ChainId } from '@aave/contract-helpers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { TorusConnector } from '@web3-react/torus-connector';
import { FrameConnector } from '@web3-react/frame-connector';
import { getNetworkConfig, getSupportedChainIds } from 'src/utils/marketsAndNetworksConfig';
import { UnsupportedChainIdError } from '@web3-react/core';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';

export enum WalletType {
  INJECTED,
  WALLET_CONNECT,
  WALLET_LINK,
  TORUS,
  FRAME,
  GNOSIS,
}

const APP_NAME = 'Aave';
const APP_LOGO_URL = 'https://aave.com/favicon.ico';

export const getWallet = (
  wallet: WalletType,
  chainId: ChainId = ChainId.mainnet
): AbstractConnector => {
  const supportedChainIds = getSupportedChainIds();

  switch (wallet) {
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
      return new WalletConnectConnector({
        rpc: supportedChainIds.reduce((acc, network) => {
          const config = getNetworkConfig(network);
          acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
          return acc;
        }, {} as { [networkId: number]: string }),
        bridge: 'https://aave.bridge.walletconnect.org',
        qrcode: true,
      });
    case WalletType.GNOSIS:
      return new SafeAppConnector();
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
