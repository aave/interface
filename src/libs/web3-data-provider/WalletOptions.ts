import { Connector } from '@web3-react/types';

import { coinbaseWallet } from './connectors/CoinbaseConnector';
import { gnosisSafe } from './connectors/GnosisSafeConnector';
import { metaMask } from './connectors/MetaMaskConnector';
import { readOnly } from './connectors/ReadOnlyConnector';
import { walletConnect } from './connectors/WalletConnectConnector';

export enum WalletType {
  INJECTED = 'injected',
  WALLET_CONNECT = 'wallet_connect',
  COINBASE_WALLET = 'coinbase_wallet',
  GNOSIS = 'gnosis',
  LEDGER = 'ledger',
  READ_ONLY_MODE = 'read_only_mode',
}

export const getWallet = (wallet: WalletType): Connector => {
  switch (wallet) {
    case WalletType.READ_ONLY_MODE:
      return readOnly;
    // case WalletType.LEDGER:
    //   return new LedgerHQFrameConnector({});
    case WalletType.INJECTED:
      return metaMask;
    case WalletType.COINBASE_WALLET:
      return coinbaseWallet;
    case WalletType.WALLET_CONNECT:
      return walletConnect;
    case WalletType.GNOSIS:
      if (window) {
        return gnosisSafe;
      }
      throw new Error('Safe app not working');
    default: {
      throw new Error(`unsupported wallet`);
    }
  }
};
