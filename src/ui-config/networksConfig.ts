import { ChainId } from '@aave/contract-helpers';
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  celo,
  Chain,
  gnosis,
  linea,
  mainnet,
  metis,
  optimism,
  optimismSepolia,
  polygon,
  scroll,
  scrollSepolia,
  sepolia,
  soneium,
  sonic,
  zksync,
} from 'wagmi/chains';

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
  publicJsonRPCUrl: readonly string[]; // public rpc used if not private found
  // https://github.com/aave/aave-api
  ratesHistoryApiUrl?: string;
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
  [ChainId.sepolia]: {
    name: 'Ethereum Sepolia',
    publicJsonRPCUrl: [
      'https://eth-sepolia.public.blastapi.io',
      'https://rpc.sepolia.org',
      'https://rpc2.sepolia.org',
      'https://rpc.sepolia.online',
      'https://www.sepoliarpc.space',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://sepolia.etherscan.io',
    isTestnet: true,
    networkLogoPath: '/icons/networks/ethereum.svg',
    wagmiChain: sepolia,
  },
  [ChainId.fuji]: {
    name: 'Avalanche Fuji',
    publicJsonRPCUrl: [
      'https://api.avax-test.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche_fuji',
      'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'AVAX',
    wrappedBaseAssetSymbol: 'WAVAX',
    baseAssetDecimals: 18,
    explorerLink: 'https://cchain.explorer.avax-test.network',
    isTestnet: true,
    networkLogoPath: '/icons/networks/avalanche.svg',
    bridge: {
      icon: '/icons/bridge/avalanche.svg',
      name: 'Avalanche Bridge',
      url: 'https://bridge.avax.network/',
    },
    wagmiChain: avalancheFuji,
  },
  [ChainId.arbitrum_sepolia]: {
    name: 'Arbitrum Sepolia',
    publicJsonRPCUrl: [
      'https://sepolia-rollup.arbitrum.io/rpc',
      'https://public.stackup.sh/api/v1/node/arbitrum-sepolia',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://sepolia.arbiscan.io',
    isTestnet: true,
    networkLogoPath: '/icons/networks/arbitrum.svg',
    wagmiChain: arbitrumSepolia,
  },
  [ChainId.base_sepolia]: {
    name: 'Base Sepolia',
    publicJsonRPCUrl: [
      'https://base-sepolia.blockpi.network/v1/rpc/public',
      'https://sepolia.base.org',
      'https://base-sepolia.gateway.tenderly.co',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://sepolia.basescan.org',
    isTestnet: true,
    networkLogoPath: '/icons/networks/base.svg',
    wagmiChain: baseSepolia,
  },
  [ChainId.optimism_sepolia]: {
    name: 'Optimism Sepolia',
    publicJsonRPCUrl: ['https://sepolia.optimism.io'],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://sepolia-optimistic.etherscan.io',
    isTestnet: true,
    networkLogoPath: '/icons/networks/optimism.svg',
    wagmiChain: optimismSepolia,
  },
  [ChainId.scroll_sepolia]: {
    name: 'Scroll Sepolia',
    publicJsonRPCUrl: [
      'https://sepolia-rpc.scroll.io',
      'https://scroll-sepolia.blockpi.network/v1/rpc/public',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://sepolia.scrollscan.dev',
    isTestnet: true,
    networkLogoPath: '/icons/networks/scroll.svg',
    wagmiChain: scrollSepolia,
  },
};

export const prodNetworkConfig: Record<string, BaseNetworkConfig> = {
  [ChainId.mainnet]: {
    name: 'Ethereum',
    publicJsonRPCUrl: [
      'https://mainnet.gateway.tenderly.co',
      'https://rpc.flashbots.net',
      'https://eth.llamarpc.com',
      'https://eth-mainnet.public.blastapi.io',
      'https://ethereum-rpc.publicnode.com',
    ],
    baseUniswapAdapter: '0xc3efa200a60883a96ffe3d5b492b121d6e9a1f3f',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://etherscan.io',
    ratesHistoryApiUrl,
    networkLogoPath: '/icons/networks/ethereum.svg',
    wagmiChain: mainnet,
  },
  [ChainId.polygon]: {
    name: 'Polygon POS',
    displayName: 'Polygon',
    publicJsonRPCUrl: [
      'https://gateway.tenderly.co/public/polygon',
      'https://polygon-pokt.nodies.app',
      'https://polygon-bor-rpc.publicnode.com',
      'https://polygon-rpc.com',
      'https://polygon-mainnet.public.blastapi.io',
      'https://rpc-mainnet.matic.quiknode.pro',
    ],
    baseAssetSymbol: 'POL',
    wrappedBaseAssetSymbol: 'WPOL',
    baseAssetDecimals: 18,
    explorerLink: 'https://polygonscan.com',
    networkLogoPath: '/icons/networks/polygon.svg',
    bridge: {
      icon: '/icons/bridge/polygon.svg',
      name: 'Polygon PoS Bridge',
      url: 'https://wallet.polygon.technology/polygon/bridge',
    },
    ratesHistoryApiUrl,
    wagmiChain: polygon,
  },
  [ChainId.avalanche]: {
    name: 'Avalanche',
    publicJsonRPCUrl: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'AVAX',
    wrappedBaseAssetSymbol: 'WAVAX',
    baseAssetDecimals: 18,
    explorerLink: 'https://cchain.explorer.avax.network',
    networkLogoPath: '/icons/networks/avalanche.svg',
    bridge: {
      icon: '/icons/bridge/avalanche.svg',
      name: 'Avalanche Bridge',
      url: 'https://bridge.avax.network/',
    },
    ratesHistoryApiUrl,
    wagmiChain: avalanche,
  },
  [ChainId.arbitrum_one]: {
    name: 'Arbitrum',
    publicJsonRPCUrl: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
      'https://1rpc.io/arb',
    ],
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
  [ChainId.base]: {
    name: 'Base',
    publicJsonRPCUrl: [
      'https://mainnet.base.org',
      'https://1rpc.io/base',
      'https://base.publicnode.com',
      'https://base-mainnet.public.blastapi.io',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://basescan.org',
    networkLogoPath: '/icons/networks/base.svg',
    bridge: {
      icon: '/icons/networks/base.svg',
      name: 'Base Bridge',
      url: 'https://bridge.base.org/',
    },
    ratesHistoryApiUrl,
    wagmiChain: base,
  },
  [ChainId.optimism]: {
    name: 'OP',
    publicJsonRPCUrl: ['https://optimism-mainnet.public.blastapi.io', 'https://1rpc.io/op'],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://optimistic.etherscan.io',
    networkLogoPath: '/icons/networks/optimism.svg',
    bridge: {
      icon: '/icons/bridge/optimism.svg',
      name: 'OP Bridge',
      url: 'https://app.optimism.io/bridge',
    },
    ratesHistoryApiUrl,
    wagmiChain: optimism,
  },
  [ChainId.metis_andromeda]: {
    name: 'Metis Andromeda',
    publicJsonRPCUrl: ['https://andromeda.metis.io/?owner=1088'],
    baseAssetSymbol: '', // N/A
    wrappedBaseAssetSymbol: '', // N/A
    baseAssetDecimals: 0, // N/A
    explorerLink: 'https://andromeda-explorer.metis.io',
    networkLogoPath: '/icons/networks/metis.svg',
    ratesHistoryApiUrl,
    wagmiChain: metis,
  },
  [ChainId.xdai]: {
    name: 'Gnosis Chain',
    publicJsonRPCUrl: ['https://gnosis-rpc.publicnode.com', 'https://rpc.gnosischain.com'],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'xDAI',
    wrappedBaseAssetSymbol: 'WXDAI',
    baseAssetDecimals: 18,
    explorerLink: 'https://gnosisscan.io',
    isTestnet: false,
    networkLogoPath: '/icons/networks/gnosis.svg',
    bridge: {
      icon: '/icons/networks/gnosis.svg',
      name: 'xDai Bridge',
      url: 'https://bridge.gnosischain.com/',
    },
    ratesHistoryApiUrl,
    wagmiChain: gnosis,
  },
  [ChainId.bnb]: {
    name: 'Binance Smart Chain',
    publicJsonRPCUrl: ['https://bsc.publicnode.com	', 'wss://bsc.publicnode.com'],
    baseAssetSymbol: 'BNB',
    wrappedBaseAssetSymbol: 'WBNB',
    baseAssetDecimals: 18,
    explorerLink: 'https://bscscan.com',
    networkLogoPath: '/icons/networks/binance.svg',
    bridge: {
      icon: '/icons/networks/binance.svg',
      name: 'BNB Bridge',
      url: 'https://www.bnbchain.org/en/bnb-chain-bridges',
    },
    ratesHistoryApiUrl,
    wagmiChain: bsc,
  },
  [ChainId.scroll]: {
    name: 'Scroll',
    publicJsonRPCUrl: ['https://rpc.scroll.io', 'https://rpc.ankr.com/scroll'],
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://scrollscan.com',
    networkLogoPath: '/icons/networks/scroll.svg',
    bridge: {
      icon: '/icons/networks/scroll.svg',
      name: 'Scroll Bridge',
      url: 'https://scroll.io/bridge',
    },
    ratesHistoryApiUrl,
    wagmiChain: scroll,
  },
  [ChainId.zksync]: {
    name: 'ZKsync',
    publicJsonRPCUrl: ['https://mainnet.era.zksync.io'],
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://era.zksync.network',
    networkLogoPath: '/icons/networks/zksync.svg',
    bridge: {
      icon: '/icons/networks/zksync.svg',
      name: 'ZKsync Bridge',
      url: 'https://portal.zksync.io/bridge/',
    },
    ratesHistoryApiUrl,
    wagmiChain: zksync,
  },
  [ChainId.linea]: {
    name: 'Linea',
    publicJsonRPCUrl: [
      'https://1rpc.io/linea',
      'https://linea.drpc.org',
      'https://linea-rpc.publicnode.com',
    ],
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://lineascan.build',
    networkLogoPath: '/icons/networks/linea.svg',
    bridge: {
      icon: '/icons/networks/linea.svg',
      name: 'Linea Bridge',
      url: 'https://bridge.linea.build/',
    },
    ratesHistoryApiUrl,
    wagmiChain: linea,
  },
  [ChainId.sonic]: {
    name: 'Sonic',
    publicJsonRPCUrl: [
      'https://rpc.soniclabs.com',
      'https://sonic.drpc.org',
      'https://sonic-rpc.publicnode.com',
    ],
    baseAssetSymbol: 'S',
    wrappedBaseAssetSymbol: 'wS',
    baseAssetDecimals: 18,
    explorerLink: 'https://sonicscan.org',
    networkLogoPath: '/icons/networks/sonic.svg',
    bridge: {
      icon: '/icons/networks/sonic.svg',
      name: 'Sonic Bridge',
      url: 'https://gateway.soniclabs.com',
    },
    ratesHistoryApiUrl,
    wagmiChain: sonic,
  },
  [ChainId.celo]: {
    name: 'Celo',
    publicJsonRPCUrl: ['https://rpc.ankr.com/celo', 'https://celo.drpc.org'],
    baseAssetSymbol: '', // N/A
    wrappedBaseAssetSymbol: '', // N/A
    baseAssetDecimals: 0, // N/A
    explorerLink: 'https://celoscan.io/',
    networkLogoPath: '/icons/networks/celo.svg',
    bridge: {
      icon: '/icons/networks/celo.svg',
      name: 'Celo Bridge',
      url: 'https://docs.celo.org/protocol/bridge',
    },
    wagmiChain: celo,
  },
  [ChainId.soneium]: {
    name: 'Soneium',
    publicJsonRPCUrl: ['https://soneium.drpc.org', 'https://rpc.soneium.org'],
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://soneium.blockscout.com',
    networkLogoPath: '/icons/networks/soneium.svg', // TODO: add logo
    bridge: {
      icon: '/icons/networks/soneium.svg',
      name: 'Soneium Bridge',
      url: 'https://soneium.org/en/bridges/',
    },
    wagmiChain: soneium,
  },
};

export const networkConfigs = {
  ...testnetConfig,
  ...prodNetworkConfig,
};
