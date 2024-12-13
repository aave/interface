import { getDefaultConfig } from 'connectkit';
import {
  ENABLE_TESTNET,
  FORK_BASE_CHAIN_ID,
  FORK_CHAIN_ID,
  FORK_ENABLED,
  FORK_RPC_URL,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';
import { type Chain } from 'viem';
import { createConfig, CreateConfigParameters, injected } from 'wagmi';
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

let prodChains: CreateConfigParameters['chains'] = [
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

const { name, baseAssetDecimals, baseAssetSymbol } = networkConfigs[FORK_BASE_CHAIN_ID];

const forkChain: Chain = {
  id: FORK_CHAIN_ID,
  name: `${name} Fork`,
  nativeCurrency: {
    decimals: baseAssetDecimals,
    name: baseAssetSymbol,
    symbol: baseAssetSymbol,
  },
  rpcUrls: {
    default: { http: [FORK_RPC_URL] },
  },
  testnet: false,
};

if (FORK_ENABLED) {
  prodChains = [forkChain, ...prodChains];
}

const defaultConfig = {
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  appName: 'Aave',
  appDescription: 'Non-custodial liquidity protocol',
  appUrl: 'https://app.aave.com',
  appIcon: 'https://avatars.githubusercontent.com/u/47617460?s=200&v=4',
};

const cypressConfig = createConfig(
  getDefaultConfig({
    chains: [forkChain],
    connectors: [injected()],
    ...defaultConfig,
  })
);

const prodConfig = createConfig(
  getDefaultConfig({
    chains: ENABLE_TESTNET ? testnetChains : prodChains,
    ...defaultConfig,
  })
);

const isCypressEnabled = process.env.NEXT_PUBLIC_IS_CYPRESS_ENABLED === 'true';

export const wagmiConfig = isCypressEnabled ? cypressConfig : prodConfig;
