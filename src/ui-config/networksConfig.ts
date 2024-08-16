import { ChainId } from '@aave/contract-helpers';

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
};

export type BaseNetworkConfig = Omit<NetworkConfig, 'explorerLinkBuilder'>;

const ratesHistoryApiUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/data/rates-history`;

export const networkConfigs: Record<string, BaseNetworkConfig> = {
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
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/ethereum.svg',
  },
  [ChainId.goerli]: {
    name: 'Ethereum Görli',
    publicJsonRPCUrl: [
      'https://eth-goerli.public.blastapi.io',
      'https://rpc.ankr.com/eth_goerli',
      'https://goerli.prylabs.net',
    ],
    publicJsonRPCWSUrl: 'wss://eth-goerli.public.blastapi.io',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://goerli.etherscan.io',
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/ethereum.svg',
  },
  [ChainId.mainnet]: {
    name: 'Ethereum',
    privateJsonRPCUrl: 'https://eth-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://rpc.ankr.com/eth',
      'https://rpc.flashbots.net',
      'https://eth-mainnet.public.blastapi.io',
      'https://cloudflare-eth.com/v1/mainnet',
    ],
    publicJsonRPCWSUrl: 'wss://eth-mainnet.alchemyapi.io/v2/demo',
    baseUniswapAdapter: '0xc3efa200a60883a96ffe3d5b492b121d6e9a1f3f',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://etherscan.io',
    ratesHistoryApiUrl,
    networkLogoPath: '/icons/networks/ethereum.svg',
  },
  [ChainId.polygon]: {
    name: 'Polygon POS',
    displayName: 'Polygon',
    privateJsonRPCUrl: 'https://poly-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://polygon-rpc.com',
      'https://polygon-mainnet.public.blastapi.io',
      'https://rpc-mainnet.matic.quiknode.pro',
    ],
    publicJsonRPCWSUrl: 'wss://polygon-rpc.com',
    baseAssetSymbol: 'MATIC',
    wrappedBaseAssetSymbol: 'WMATIC',
    baseAssetDecimals: 18,
    explorerLink: 'https://polygonscan.com',
    networkLogoPath: '/icons/networks/polygon.svg',
    bridge: {
      icon: '/icons/bridge/polygon.svg',
      name: 'Polygon PoS Bridge',
      url: 'https://wallet.polygon.technology/polygon/bridge',
    },
    ratesHistoryApiUrl,
  },
  [ChainId.fuji]: {
    name: 'Avalanche Fuji',
    publicJsonRPCUrl: [
      'https://api.avax-test.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche_fuji',
      'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc',
    ],
    publicJsonRPCWSUrl: 'wss://api.avax-test.network/ext/bc/C/rpc',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'AVAX',
    wrappedBaseAssetSymbol: 'WAVAX',
    baseAssetDecimals: 18,
    explorerLink: 'https://cchain.explorer.avax-test.network',
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/avalanche.svg',
    bridge: {
      icon: '/icons/bridge/avalanche.svg',
      name: 'Avalanche Bridge',
      url: 'https://bridge.avax.network/',
    },
  },
  [ChainId.avalanche]: {
    name: 'Avalanche',
    privateJsonRPCUrl: 'https://avax-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche',
    ],
    publicJsonRPCWSUrl: 'wss://api.avax.network/ext/bc/C/rpc',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'AVAX',
    wrappedBaseAssetSymbol: 'WAVAX',
    baseAssetDecimals: 18,
    explorerLink: 'https://cchain.explorer.avax.network',
    // usdMarket: true,
    networkLogoPath: '/icons/networks/avalanche.svg',
    bridge: {
      icon: '/icons/bridge/avalanche.svg',
      name: 'Avalanche Bridge',
      url: 'https://bridge.avax.network/',
    },
    ratesHistoryApiUrl,
  },
  [ChainId.arbitrum_goerli]: {
    name: 'Arbitrum Görli',
    publicJsonRPCUrl: [
      'https://goerli-rollup.arbitrum.io/rpc',
      'https://arb-goerli.g.alchemy.com/v2/demo',
    ],
    publicJsonRPCWSUrl: 'wss://goerli-rollup.arbitrum.io/rpc',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://goerli.arbiscan.io',
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/arbitrum.svg',
    bridge: {
      icon: '/icons/bridge/arbitrum.svg',
      name: 'Arbitrum Bridge',
      url: 'https://bridge.arbitrum.io',
    },
  },
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
  },
  [ChainId.arbitrum_one]: {
    name: 'Arbitrum',
    privateJsonRPCUrl: 'https://arbitrum-one.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
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
    // usdMarket: true,
    networkLogoPath: '/icons/networks/arbitrum.svg',
    bridge: {
      icon: '/icons/bridge/arbitrum.svg',
      name: 'Arbitrum Bridge',
      url: 'https://bridge.arbitrum.io',
    },
    ratesHistoryApiUrl,
  },
  [ChainId.base]: {
    name: 'Base',
    privateJsonRPCUrl: 'https://base-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
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
    // usdMarket: true,
    networkLogoPath: '/icons/networks/base.svg',
    bridge: {
      icon: '/icons/networks/base.svg',
      name: 'Base Bridge',
      url: 'https://bridge.base.org/',
    },
    ratesHistoryApiUrl,
  },
  [ChainId.base_sepolia]: {
    name: 'Base Sepolia',
    publicJsonRPCUrl: [
      'https://rpc.notadegen.com/base/sepolia',
      'https://base-sepolia.blockpi.network/v1/rpc/public',
      'https://public.stackup.sh/api/v1/node/base-sepolia',
    ],
    publicJsonRPCWSUrl: 'wss://base-sepolia-rpc.publicnode.com',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://sepolia.basescan.org/',
    isTestnet: true,
    networkLogoPath: '/icons/networks/base.svg',
  },

  [ChainId.harmony]: {
    name: 'Harmony',
    privateJsonRPCUrl: 'https://harmony-0.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://api.s0.t.hmny.io',
      'https://api.harmony.one',
      'https://rpc.ankr.com/harmony',
    ],
    publicJsonRPCWSUrl: 'wss://ws.s0.t.hmny.io',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ONE',
    wrappedBaseAssetSymbol: 'WONE',
    baseAssetDecimals: 18,
    explorerLink: 'https://explorer.harmony.one',
    // usdMarket: true,
    networkLogoPath: '/icons/networks/harmony.svg',
    bridge: {
      icon: '/icons/bridge/harmony.svg',
      name: 'Harmony Bridge',
      url: 'https://bridge.harmony.one',
    },
    ratesHistoryApiUrl,
  },
  [ChainId.optimism]: {
    name: 'Optimism',
    privateJsonRPCUrl: 'https://optimism-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: ['https://optimism-mainnet.public.blastapi.io', 'https://1rpc.io/op'],
    publicJsonRPCWSUrl: 'wss://optimism-mainnet.public.blastapi.io',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH', // OETH
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://optimistic.etherscan.io',
    // usdMarket: true,
    networkLogoPath: '/icons/networks/optimism.svg',
    bridge: {
      icon: '/icons/bridge/optimism.svg',
      name: 'Optimism Bridge',
      url: 'https://app.optimism.io/bridge',
    },
    ratesHistoryApiUrl,
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
  },
  [ChainId.scroll_sepolia]: {
    name: 'Scroll Sepolia',
    publicJsonRPCUrl: [
      'https://sepolia-rpc.scroll.io',
      'https://scroll-sepolia.blockpi.network/v1/rpc/public',
    ],
    publicJsonRPCWSUrl: 'wss://sepolia-rpc.scroll.io',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://sepolia.scrollscan.dev',
    isTestnet: true,
    networkLogoPath: '/icons/networks/scroll.svg',
  },
  [ChainId.fantom]: {
    name: 'Fantom',
    privateJsonRPCUrl: 'https://fantom-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://rpc.fantom.network',
      'https://rpc.ankr.com/fantom',
      'https://fantom-mainnet.public.blastapi.io',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'FTM',
    wrappedBaseAssetSymbol: 'WFTM',
    baseAssetDecimals: 18,
    explorerLink: 'https://ftmscan.com',
    // usdMarket: true,
    networkLogoPath: '/icons/networks/fantom.svg',
    bridge: {
      icon: '/icons/bridge/fantom.svg',
      name: 'Fantom Bridge',
      url: 'https://app.multichain.org/#/router',
    },
    ratesHistoryApiUrl,
  },
  [ChainId.fantom_testnet]: {
    name: 'Fantom Testnet',
    publicJsonRPCUrl: [
      'https://rpc.testnet.fantom.network',
      'https://fantom-testnet.public.blastapi.io',
      'https://rpc.ankr.com/fantom_testnet',
    ],
    publicJsonRPCWSUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'FTM',
    wrappedBaseAssetSymbol: 'WFTM',
    baseAssetDecimals: 18,
    explorerLink: 'https://testnet.ftmscan.com',
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/fantom.svg',
    bridge: {
      icon: '/icons/bridge/fantom.svg',
      name: 'Fantom Bridge',
      url: 'https://app.multichain.org/#/router',
    },
  },
  [ChainId.metis_andromeda]: {
    name: 'Metis Andromeda',
    privateJsonRPCUrl: 'https://metis-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: ['https://andromeda.metis.io/?owner=1088'],
    baseAssetSymbol: '', // N/A
    wrappedBaseAssetSymbol: '', // N/A
    baseAssetDecimals: 0, // N/A
    explorerLink: 'https://andromeda-explorer.metis.io',
    networkLogoPath: '/icons/networks/metis.svg',
    ratesHistoryApiUrl,
  },
  [ChainId.xdai]: {
    name: 'Gnosis Chain',
    privateJsonRPCUrl: 'https://gnosischain-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',

    publicJsonRPCUrl: ['https://rpc.ankr.com/gnosis', 'https://rpc.gnosischain.com'],
    publicJsonRPCWSUrl: 'wss://rpc.gnosischain.com/wss',
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
  },
  [ChainId.bnb]: {
    name: 'Binance Smart Chain',
    privateJsonRPCUrl: 'https://bsc-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: ['https://bsc.publicnode.com	', 'wss://bsc.publicnode.com'],
    publicJsonRPCWSUrl: 'wss://bsc.publicnode.com',
    baseAssetSymbol: 'BNB',
    wrappedBaseAssetSymbol: 'WBNB',
    baseAssetDecimals: 18,
    explorerLink: 'https://bscscan.com/',
    networkLogoPath: '/icons/networks/binance.svg',
    bridge: {
      icon: '/icons/networks/binance.svg',
      name: 'BNB Bridge',
      url: 'https://www.bnbchain.org/en/bnb-chain-bridges',
    },
    ratesHistoryApiUrl,
  },

  [ChainId.scroll]: {
    name: 'Scroll',
    // privateJsonRPCUrl: 'https://scroll-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: ['https://rpc.scroll.io', 'https://rpc.ankr.com/scroll'],
    publicJsonRPCWSUrl: 'wss://bsc.publicnode.com',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://scrollscan.com/',
    networkLogoPath: '/icons/networks/scroll.svg',
    bridge: {
      icon: '/icons/networks/scroll.svg',
      name: 'Scroll Bridge',
      url: 'https://scroll.io/bridge',
    },
    ratesHistoryApiUrl,
  },
  [324]: {
    name: 'ZkSync',
    // privateJsonRPCUrl: 'https://scroll-mainnet.rpc.grove.city/v1/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: ['https://1rpc.io/zksync2-era', 'https://zksync.drpc.org'],
    publicJsonRPCWSUrl: 'wss://zksync.drpc.org',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://explorer.zksync.io/',
    isTestnet: false,
    networkLogoPath: '/icons/networks/zksync.svg',
    bridge: {
      icon: '/icons/networks/zksync.svg',
      name: 'Zksync Bridge',
      url: 'https://portal.zksync.io/bridge/',
    },
    ratesHistoryApiUrl,
  },
} as const;
