import { Connector } from '@web3-react/types';

// import { LedgerHQFrameConnector } from 'web3-ledgerhq-frame-connector';
import { coinbaseWallet } from './connectors/CoinbaseConnector';
import { gnosisSafe } from './connectors/GnosisSafeConnector';
import { metaMask } from './connectors/MetamaskConnector';
import { readOnly } from './connectors/ReadOnlyConnector';
import { walletConnect } from './connectors/WalletConnectConnector';

export enum WalletType {
  INJECTED = 'injected',
  WALLET_CONNECT = 'wallet_connect',
  WALLET_LINK = 'wallet_link',
  TORUS = 'torus',
  FRAME = 'frame',
  GNOSIS = 'gnosis',
  LEDGER = 'ledger',
  READ_ONLY_MODE = 'read_only_mode',
  COINBASE_WALLET = 'coinbase_wallet',
}

// const APP_NAME = 'Aave';
// const APP_LOGO_URL = 'https://aave.com/favicon.ico';

export const getWallet = (wallet: WalletType): Connector => {
  console.log('wallet', wallet);
  switch (wallet) {
    case WalletType.READ_ONLY_MODE:
      return readOnly;
    // case WalletType.LEDGER:
    //   return new LedgerHQFrameConnector({});
    case WalletType.INJECTED:
      return metaMask;
    case WalletType.COINBASE_WALLET:
      return coinbaseWallet;
    // case WalletType.WALLET_LINK:
    //   const networkConfig = getNetworkConfig(chainId);
    //   return new WalletLinkConnector({
    //     appName: APP_NAME,
    //     appLogoUrl: APP_LOGO_URL,
    //     url: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0],
    //   });
    case WalletType.WALLET_CONNECT:
      return walletConnect;
    case WalletType.GNOSIS:
      if (window) {
        return gnosisSafe;
      }
      throw new Error('Safe app not working');
    // case WalletType.TORUS:
    //   return new TorusConnector({
    //     chainId,
    //     initOptions: {
    //       network: {
    //         host: chainId === ChainId.polygon ? 'matic' : chainId,
    //       },
    //       showTorusButton: false,
    //       enableLogging: false,
    //       enabledVerifiers: false,
    //     },
    //   });
    // case WalletType.FRAME: {
    //   if (chainId !== ChainId.mainnet) {
    //     throw new UnsupportedChainIdError(chainId, [1]);
    //   }
    //   return new FrameConnector({ supportedChainIds: [1] });
    // }
    default: {
      throw new Error(`unsupported wallet`);
    }
  }
};
