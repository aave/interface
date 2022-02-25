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
