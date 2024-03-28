import { ChainId } from '@aave/contract-helpers';
import { initializeConnector } from '@web3-react/core';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { getNetworkConfig, getSupportedChainIds } from 'src/utils/marketsAndNetworksConfig';

export class UserRejectedRequestError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = 'The user rejected the request.';
  }
}

const supportedChainIds = getSupportedChainIds();

const rpcMap = supportedChainIds.reduce((acc, network) => {
  const config = getNetworkConfig(network);
  acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
  return acc;
}, {} as { [networkId: number]: string });

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        optionalChains: supportedChainIds,
        chains: [ChainId.mainnet],
        rpcMap,
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
        showQrModal: true,
      },
    })
);
