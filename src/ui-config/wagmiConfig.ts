import { getDefaultConfig } from 'connectkit';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';
import { createConfig, CreateConfigParameters } from 'wagmi';
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  gnosis,
  mainnet,
  metis,
  optimism,
  optimismSepolia,
  polygon,
  scroll,
  scrollSepolia,
  sepolia,
  zksync,
} from 'wagmi/chains';

const testnetChains: CreateConfigParameters['chains'] = [
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  avalancheFuji,
  optimismSepolia,
  scrollSepolia,
];

const prodChains: CreateConfigParameters['chains'] = [
  mainnet,
  base,
  arbitrum,
  avalanche,
  optimism,
  polygon,
  metis,
  gnosis,
  bsc,
  scroll,
  zksync,
];

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: ENABLE_TESTNET ? testnetChains : prodChains,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    appName: 'Aave',
    appDescription: 'Non-custodial liquidity protocol',
    appUrl: 'https://app.aave.com',
    appIcon: 'https://avatars.githubusercontent.com/u/47617460?s=200&v=4',
  })
);
