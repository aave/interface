import Torus from '@toruslabs/torus-embed';
import WalletConnect from '@walletconnect/web3-provider';
import ethProvider from 'eth-provider';
import { getNetworkConfig, getSupportedChainIds } from 'src/utils/marketsAndNetworksConfig';
import WalletLink from 'walletlink';
import Web3Modal from 'web3modal';

const POLLING_INTERVAL = 12000;
const APP_NAME = 'Aave';
const APP_LOGO_URL = 'https://aave.com/favicon.ico';

export const getWeb3Modal = () => {
  const supportedChainIds = getSupportedChainIds();
  return new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnect,
        options: {
          rpc: supportedChainIds.reduce((acc, network) => {
            const config = getNetworkConfig(network);
            acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
            return acc;
          }, {} as { [networkId: number]: string }),
          bridge: 'https://aave.bridge.walletconnect.org',
          qrcode: true,
          pollingInterval: POLLING_INTERVAL,
        },
      },
      torus: {
        package: Torus,
      },
      walletlink: {
        package: WalletLink,
        options: {
          appName: APP_NAME,
          appLogoUrl: APP_LOGO_URL,
          rpc: supportedChainIds.reduce((acc, network) => {
            const config = getNetworkConfig(network);
            acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
            return acc;
          }, {} as { [networkId: number]: string }),
        },
      },
      frame: {
        package: ethProvider, // required
      },
      // mewconnect: {
      //   package: MewConnect, // required
      //   options: {
      //     rpc: supportedChainIds.reduce((acc, network) => {
      //       const config = getNetworkConfig(network);
      //       acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
      //       return acc;
      //     }, {} as { [networkId: number]: string }),
      //   },
      // },
    },
  });
};
