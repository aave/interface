import { ChainId } from '@aave/contract-helpers';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { initializeConnector } from '@web3-react/core';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

const networkConfig = getNetworkConfig(ChainId.mainnet);

const APP_NAME = 'Aave';
const APP_LOGO_URL = 'https://aave.com/favicon.ico';

export const [coinbaseWallet, hooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        /* Coinbase Wallet SDK uses an rpcUrl provided by Coinbase Wallet clients regardless of the rpcUrl passed into
         * makeWeb3Provider for whitelisted networks. Wallet SDK needs an rpcUrl to be provided by the dapp as a fallback.
         */
        url: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0],
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
      },
    })
);
