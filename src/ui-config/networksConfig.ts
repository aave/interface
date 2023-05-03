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
  privateJsonRPCUrl?: string; // private rpc will be used for rpc queries inside the client. normally has private api key and better rate
  privateJsonRPCWSUrl?: string;
  publicJsonRPCUrl: readonly string[]; // public rpc used if not private found, and used to add specific network to wallets if user don't have them. Normally with slow rates
  publicJsonRPCWSUrl?: string;
  // protocolDataUrl: string;
  // https://github.com/aave/aave-api
  ratesHistoryApiUrl?: string;
  // cachingServerUrl?: string;
  // cachingWSServerUrl?: string;
  baseUniswapAdapter?: string;
  /**
   * When this is set withdrawals will automatically be unwrapped
   */
  wrappedBaseAssetSymbol?: string;
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

export const networkConfigs: Record<string, BaseNetworkConfig> = {
  [ChainId.sepolia]: {
    name: 'Ethereum Sepolia',
    privateJsonRPCUrl: 'https://eth-sepolia.g.alchemy.com/v2/DcgsmYhsMAhCarVoqRmSLnMUH2i__wlM',
    publicJsonRPCUrl: [],
    // publicJsonRPCWSUrl: 'wss://eth-goerli.public.blastapi.io',
    // protocolDataUrl: '',
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
    privateJsonRPCUrl: 'https://eth-goerli.g.alchemy.com/v2/Svm_hYMBAm9sUyqpEVxtCi6WhefbBvdl',
    publicJsonRPCUrl: ['https://eth-goerli.public.blastapi.io', 'https://rpc.ankr.com/eth_goerli'],
    publicJsonRPCWSUrl: 'wss://eth-goerli.public.blastapi.io',
    // protocolDataUrl: '',
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
    privateJsonRPCUrl: 'https://eth-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://rpc.ankr.com/eth',
      'https://rpc.flashbots.net',
      'https://eth-mainnet.public.blastapi.io',
      'https://cloudflare-eth.com/v1/mainnet',
    ],
    publicJsonRPCWSUrl: 'wss://eth-mainnet.alchemyapi.io/v2/demo',
    // cachingServerUrl: 'https://cache-api-1.aave.com/graphql',
    // cachingWSServerUrl: 'wss://cache-api-1.aave.com/graphql',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
    baseUniswapAdapter: '0xc3efa200a60883a96ffe3d5b492b121d6e9a1f3f',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://etherscan.io',
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
    networkLogoPath: '/icons/networks/ethereum.svg',
  },
  [ChainId.polygon]: {
    name: 'Polygon POS',
    privateJsonRPCUrl: 'https://poly-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://polygon-rpc.com',
      'https://polygon-mainnet.public.blastapi.io',
      'https://rpc-mainnet.matic.quiknode.pro',
    ],
    publicJsonRPCWSUrl: 'wss://polygon-rpc.com',
    // cachingServerUrl: 'https://cache-api-137.aave.com/graphql',
    // cachingWSServerUrl: 'wss://cache-api-137.aave.com/graphql',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic',
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
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
  },
  [ChainId.mumbai]: {
    name: 'Mumbai',
    publicJsonRPCUrl: [
      'https://rpc.ankr.com/polygon_mumbai',
      'https://rpc-mumbai.maticvigil.com',
      'https://polygon-testnet.public.blastapi.io',
      'https://polygon-mumbai.g.alchemy.com/v2/demo',
    ],
    publicJsonRPCWSUrl: 'wss://polygon-mumbai.g.alchemy.com/v2/demo',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-polygon-mumbai',
    baseAssetSymbol: 'MATIC',
    wrappedBaseAssetSymbol: 'WMATIC',
    baseAssetDecimals: 18,
    explorerLink: 'https://explorer-mumbai.maticvigil.com',
    isTestnet: true,
    networkLogoPath: '/icons/networks/polygon.svg',
  },
  [ChainId.fuji]: {
    name: 'Avalanche Fuji',
    publicJsonRPCUrl: [
      'https://api.avax-test.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche_fuji',
      'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc',
    ],
    publicJsonRPCWSUrl: 'wss://api.avax-test.network/ext/bc/C/rpc',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-fuji',
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
    privateJsonRPCUrl:
      'https://avax-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca/ext/bc/C/rpc',
    publicJsonRPCUrl: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche',
    ],
    publicJsonRPCWSUrl: 'wss://api.avax.network/ext/bc/C/rpc',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-avalanche',
    // cachingServerUrl: 'https://cache-api-43114.aave.com/graphql',
    // cachingWSServerUrl: 'wss://cache-api-43114.aave.com/graphql',
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
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
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
  [ChainId.arbitrum_one]: {
    name: 'Arbitrum',
    publicJsonRPCUrl: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
      'https://1rpc.io/arb',
    ],
    publicJsonRPCWSUrl: 'wss://arb1.arbitrum.io/rpc',
    // protocolDataUrl: '',
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
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
  },
  [ChainId.harmony]: {
    name: 'Harmony',
    privateJsonRPCUrl: 'https://harmony-0.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://api.s0.t.hmny.io',
      'https://api.harmony.one',
      'https://rpc.ankr.com/harmony',
    ],
    publicJsonRPCWSUrl: 'wss://ws.s0.t.hmny.io',
    // protocolDataUrl: '',
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
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
  },
  [ChainId.optimism]: {
    name: 'Optimism',
    privateJsonRPCUrl:
      'https://optimism-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://optimism-mainnet.public.blastapi.io',
      'https://1rpc.io/op',
      'https://rpc.ankr.com/optimism',
    ],
    publicJsonRPCWSUrl: 'wss://optimism-mainnet.public.blastapi.io',
    // protocolDataUrl: '',
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
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
  },
  [ChainId.optimism_goerli]: {
    name: 'Optimism Görli',
    publicJsonRPCUrl: ['https://goerli.optimism.io', 'https://opt-goerli.g.alchemy.com/v2/demo'],
    publicJsonRPCWSUrl: 'wss://goerli.optimism.io',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://l2-explorer.surge.sh',
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/optimism.svg',
    // bridge: {
    //   icon: '/icons/bridge/optimism.svg',
    //   name: 'Optimism Bridge',
    //   url: 'https://app.optimism.io/bridge',
    // },
  },
  [ChainId.scroll_alpha]: {
    name: 'Scroll Alpha',
    publicJsonRPCUrl: [
      'https://alpha-rpc.scroll.io/l2',
      'https://scroll-alphanet.public.blastapi.io',
    ],
    publicJsonRPCWSUrl: 'wss://scroll-alphanet.public.blastapi.io',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://blockscout.scroll.io',
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/scroll.svg',
    // bridge: {
    //   icon: '/icons/bridge/scroll.svg',
    //   name: 'Scroll Alpha Bridge',
    //   url: 'https://scroll.io/alpha/bridge',
    // },
  },
  [ChainId.fantom]: {
    name: 'Fantom',
    privateJsonRPCUrl: 'https://fantom-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [
      'https://rpc.fantom.network',
      'https://rpc.ankr.com/fantom',
      'https://fantom-mainnet.public.blastapi.io',
    ],
    // publicJsonRPCWSUrl: 'wss://wsapi.fantom.network',
    // protocolDataUrl: '',
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
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
  },
  [ChainId.fantom_testnet]: {
    name: 'Fantom Testnet',
    publicJsonRPCUrl: [
      'https://rpc.testnet.fantom.network',
      'https://fantom-testnet.public.blastapi.io',
      'https://rpc.ankr.com/fantom_testnet',
    ],
    publicJsonRPCWSUrl: '',
    // protocolDataUrl: '',
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
} as const;
