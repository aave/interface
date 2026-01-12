import { ChainId } from '@aave/contract-helpers';
import { arbitrum, arbitrumSepolia, Chain } from 'wagmi/chains';

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

const ratesHistoryApiUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/data/rates-history`;

export const testnetConfig: Record<string, BaseNetworkConfig> = {
  [ChainId.arbitrum_sepolia]: {
    name: 'Arbitrum Sepolia',
    publicJsonRPCUrl: [
      'https://sepolia-rollup.arbitrum.io/rpc',
      'https://public.stackup.sh/api/v1/node/arbitrum-sepolia',
    ],
    publicJsonRPCWSUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
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

export const prodNetworkConfig: Record<string, BaseNetworkConfig> = {
  [ChainId.arbitrum_one]: {
    name: 'Arbitrum',
    privateJsonRPCUrl: 'https://arb-mainnet.g.alchemy.com/v2/2oA-8BGeYqHHpd2uCU49IzeZDL9skdSm', //'https://arbitrum-one.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
      'https://1rpc.io/arb',
    ],
    publicJsonRPCWSUrl: 'wss://arb1.arbitrum.io/rpc',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://arbiscan.io',
    networkLogoPath: '/icons/networks/arbitrum.svg',
    bridge: {
      icon: '/icons/bridge/arbitrum.svg',
      name: 'Arbitrum Bridge',
      url: 'https://bridge.arbitrum.io',
    },
    ratesHistoryApiUrl,
    wagmiChain: arbitrum,
  },
};

export const networkConfigs = {
  ...testnetConfig,
  ...prodNetworkConfig,
};
