import { ChainId } from '@aave/contract-helpers';
import { CoinbaseWallet } from '@web3-react-coinbase-wallet-v8';
import { initializeConnector } from '@web3-react-core-v8';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
// import { APP_LOGO_URL, APP_NAME } from 'src/utils/utils';

export const CoinbaseWalletConnector = (chainId: ChainId) => {
  const networkConfig = getNetworkConfig(chainId);
  const [coinbaseWallet, hooks] = initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet(
        actions,
        {
          url: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0],
          // appName: APP_NAME,
          // appLogoUrl: APP_LOGO_URL,
        },
        false
      )
  );
  return [coinbaseWallet, hooks];
};
