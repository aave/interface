import { inAppWalletConnector } from '@thirdweb-dev/wagmi-adapter';
import { Emitter } from '@wagmi/core/internal';
import { getDefaultConfig } from 'connectkit';
import {
  ENABLE_TESTNET,
  FORK_BASE_CHAIN_ID,
  FORK_CHAIN_ID,
  FORK_ENABLED,
  FORK_RPC_URL,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';
import { createThirdwebClient, defineChain as thirdwebDefineChain } from 'thirdweb';
import { type Chain } from 'viem';
import { createConfig, CreateConfigParameters, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, safe } from 'wagmi/connectors';

import { prodNetworkConfig, testnetConfig } from './networksConfig';

const thirdwebClientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '4e8c81182c3709ee441e30d776223354';
const unicornFactoryAddress =
  process.env.NEXT_PUBLIC_UNICORN_FACTORY_ADDRESS || '0xD771615c873ba5a2149D5312448cE01D677Ee48A';

// Create Thirdweb Client
const client = createThirdwebClient({
  clientId: thirdwebClientId,
});

// Create the Unicorn Wallet Connector (using Thirdweb In-App Wallet)
// Note: The chain specified here is for the smart account functionality as per Unicorn docs.
const unicornConnector = inAppWalletConnector({
  client,
  smartAccount: {
    sponsorGas: true, // or false based on your needs / Unicorn requirements
    chain: thirdwebDefineChain(mainnet.id),
    factoryAddress: unicornFactoryAddress,
  },
  metadata: {
    name: 'Unicorn.eth',
    icon: '/unicorn.png',
    image: {
      src: '/unicorn.png',
      alt: 'Unicorn.eth',
      height: 100,
      width: 100,
    },
  },
});

const testnetChains = Object.values(testnetConfig).map((config) => config.wagmiChain) as [
  Chain,
  ...Chain[]
];

let prodChains = Object.values(prodNetworkConfig).map((config) => config.wagmiChain) as [
  Chain,
  ...Chain[]
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

const getTransport = (chainId: number) => {
  return networkConfigs[chainId].publicJsonRPCUrl[0];
};

const buildTransports = (chains: CreateConfigParameters['chains']) =>
  Object.fromEntries(chains.map((chain) => [chain.id, http(getTransport(chain.id))]));

const prodCkConfig = getDefaultConfig({
  chains: ENABLE_TESTNET ? testnetChains : prodChains,
  transports: ENABLE_TESTNET ? undefined : buildTransports(prodChains),
  ...defaultConfig,
});

const familyConnectorId = 'familyAccountsProvider';

const connectorConfig = {
  chains: prodCkConfig.chains,
  emitter: new Emitter(''),
};

prodCkConfig.connectors = [unicornConnector, ...(prodCkConfig.connectors || [])];

const connectors = prodCkConfig.connectors
  ?.map((connector) => {
    // initialize the connector with the emitter so we can access the id
    const c = connector(connectorConfig);
    if (c.id === 'safe') {
      return safe({
        allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/, /dhedge.org$/],
      });
    } else {
      return connector;
    }
  })
  .sort((a, b) => {
    // sort connectors so the family connector is last
    // fixes slow wallet connections when running in the Safe UI
    if (a(connectorConfig).id === familyConnectorId) {
      return 1;
    }
    if (b(connectorConfig).id === familyConnectorId) {
      return -1;
    }
    return 0;
  });

const prodConfig = createConfig({
  ...prodCkConfig,
  connectors,
});

const isCypressEnabled = process.env.NEXT_PUBLIC_IS_CYPRESS_ENABLED === 'true';

export const wagmiConfig = isCypressEnabled ? cypressConfig : prodConfig;
