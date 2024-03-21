import type { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { Web3ReactHooks } from '@web3-react/core';
import type { GnosisSafe } from '@web3-react/gnosis-safe';
import type { MetaMask } from '@web3-react/metamask';
import type { WalletConnect } from '@web3-react/walletconnect-v2';

import { coinbaseWallet, hooks as coinbaseWalletHooks } from './CoinbaseConnector';
import { gnosisSafe, hooks as gnosisSafeHooks } from './GnosisSafeConnector';
import { hooks as metaMaskHooks, metaMask } from './MetaMaskConnector';
import { hooks as walletConnectHooks, walletConnect } from './WalletConnectConnector';

export const connectors: [
  MetaMask | WalletConnect | CoinbaseWallet | GnosisSafe,
  Web3ReactHooks
][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [gnosisSafe, gnosisSafeHooks],
];
