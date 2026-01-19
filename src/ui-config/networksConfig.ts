import { ChainId } from '@aave/contract-helpers';
import { arbitrumSepolia, Chain } from 'wagmi/chains';

const MONAD_CHAIN_ID = 105;

export type ExplorerLinkBuilderProps = {
  tx?: string;
  address?: string;
};

export type ExplorerLinkBuilderConfig = {
  baseUrl: string;
  addressPrefix?: string;
  txPrefix?: string;
};

export type NetworkConfig = {
  name: string;
  displayName?: string;
  privateJsonRPCUrl?: string; // private rpc will be used for rpc queries inside the client. normally has private api key and better rate
  privateJsonRPCWSUrl?: string;
  publicJsonRPCUrl: readonly string[]; // public rpc used if not private found, and used to add specific network to wallets if user don't have them. Normally with slow rates
  publicJsonRPCWSUrl?: string;
  // https://github.com/aave/aave-api
  ratesHistoryApiUrl?: string;
  // cachingServerUrl?: string;
  // cachingWSServerUrl?: string;
  baseUniswapAdapter?: string;
  /**
   * When this is set withdrawals will automatically be unwrapped
   */
  wrappedBaseAssetSymbol: string;
  baseAssetSymbol: string;
  // needed for configuring the chain on metemask when it doesn't exist yet
  baseAssetDecimals: number;
  // usdMarket?: boolean;
  // function returning a link to etherscan et al
  explorerLink: string;
  explorerLinkBuilder: (props: ExplorerLinkBuilderProps) => string;
  // set this to show faucets and similar
  isTestnet?: boolean;
  // get's automatically populated on fork networks
  isFork?: boolean;
  networkLogoPath: string;
  // contains the forked off chainId
  underlyingChainId?: number;
  bridge?: {
    icon: string;
    name: string;
    url: string;
  };
  wagmiChain: Chain;
};

export type BaseNetworkConfig = Omit<NetworkConfig, 'explorerLinkBuilder'>;

export const testnetConfig: Record<string, BaseNetworkConfig> = {
  [ChainId.arbitrum_sepolia]: {
    name: 'Arbitrum Sepolia',
    privateJsonRPCUrl:
      process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    privateJsonRPCWSUrl:
      process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_WS_RPC_URL || 'wss://sepolia-rollup.arbitrum.io/rpc',
    publicJsonRPCUrl: [
      process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
      'https://public.stackup.sh/api/v1/node/arbitrum-sepolia',
    ],
    publicJsonRPCWSUrl:
      process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_WS_RPC_URL || 'wss://sepolia-rollup.arbitrum.io/rpc',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://sepolia.arbiscan.io',
    isTestnet: true,
    networkLogoPath: '/icons/networks/arbitrum.svg',
    wagmiChain: arbitrumSepolia,
  },
};

const monadChain: Chain = {
  id: MONAD_CHAIN_ID,
  name: 'Monad',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL || 'https://explorer.monad.xyz',
    },
  },
  testnet: false,
};

export const prodNetworkConfig: Record<string, BaseNetworkConfig> = {
  [MONAD_CHAIN_ID]: {
    name: 'Monad',
    displayName: 'Monad',
    privateJsonRPCUrl: process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.monad.xyz',
    privateJsonRPCWSUrl: process.env.NEXT_PUBLIC_MONAD_WS_RPC_URL,
    publicJsonRPCUrl: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.monad.xyz'],
    publicJsonRPCWSUrl: process.env.NEXT_PUBLIC_MONAD_WS_RPC_URL,
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'MON',
    wrappedBaseAssetSymbol: 'WMON',
    baseAssetDecimals: 18,
    explorerLink: process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL || 'https://explorer.monad.xyz',
    networkLogoPath: '/icons/networks/monad.svg',
    wagmiChain: monadChain,
  },
};

export const networkConfigs = {
  ...testnetConfig,
  ...prodNetworkConfig,
};
