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
  // rpcOnly?: boolean;
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
  [ChainId.kovan]: {
    name: 'Kovan',
    publicJsonRPCUrl: ['https://eth-kovan.alchemyapi.io/v2/demo', 'https://kovan.poa.network'],
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan',
    baseUniswapAdapter: '0xf86Be05f535EC2d217E4c6116B3fa147ee5C05A1',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://kovan.etherscan.io',
    // rpcOnly: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/ethereum.svg',
  },
  [ChainId.rinkeby]: {
    name: 'Rinkeby',
    publicJsonRPCUrl: [
      // 'https://eth-rinkeby.alchemyapi.io/v2/demo',
      'https://rinkeby-light.eth.linkpool.io/',
    ],
    // protocolDataUrl: '',
    baseUniswapAdapter: '',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://rinkeby.etherscan.io/',
    // rpcOnly: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/ethereum.svg',
  },
  [ChainId.mainnet]: {
    name: 'Ethereum',
    publicJsonRPCUrl: [
      'https://cloudflare-eth.com',
      'https://rpc.flashbots.net/',
      // 'https://eth-mainnet.alchemyapi.io/v2/demo',
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
    // rpcOnly: false,
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
    networkLogoPath: '/icons/networks/ethereum.svg',
  },
  [ChainId.polygon]: {
    name: 'Polygon POS',
    publicJsonRPCUrl: ['https://polygon-rpc.com'],
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
      url: 'https://wallet.matic.network/bridge/',
    },
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
  },
  [ChainId.mumbai]: {
    name: 'Mumbai',
    publicJsonRPCUrl: ['https://rpc-mumbai.maticvigil.com'],
    publicJsonRPCWSUrl: 'wss://rpc-mumbai.maticvigil.com',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-polygon-mumbai',
    baseAssetSymbol: 'MATIC',
    wrappedBaseAssetSymbol: 'WMATIC',
    baseAssetDecimals: 18,
    explorerLink: 'https://explorer-mumbai.maticvigil.com',
    // rpcOnly: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/polygon.svg',
  },
  [ChainId.fuji]: {
    name: 'Fuji',
    publicJsonRPCUrl: ['https://api.avax-test.network/ext/bc/C/rpc'],
    publicJsonRPCWSUrl: 'wss://api.avax-test.network/ext/bc/C/rpc',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-fuji',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'AVAX',
    wrappedBaseAssetSymbol: 'WAVAX',
    baseAssetDecimals: 18,
    explorerLink: 'https://cchain.explorer.avax-test.network',
    // rpcOnly: true,
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
    publicJsonRPCUrl: ['https://api.avax.network/ext/bc/C/rpc'],
    publicJsonRPCWSUrl: 'wss://api.avax.network/ext/bc/C/rpc',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-avalanche',
    // cachingServerUrl: 'https://cache-api-43114.aave.com/graphql',
    // cachingWSServerUrl: 'wss://cache-api-43114.aave.com/graphql',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'AVAX',
    wrappedBaseAssetSymbol: 'WAVAX',
    baseAssetDecimals: 18,
    explorerLink: 'https://cchain.explorer.avax.network',
    // rpcOnly: false,
    // usdMarket: true,
    networkLogoPath: '/icons/networks/avalanche.svg',
    bridge: {
      icon: '/icons/bridge/avalanche.svg',
      name: 'Avalanche Bridge',
      url: 'https://bridge.avax.network/',
    },
    ratesHistoryApiUrl: 'https://aave-api-v2.aave.com/data/rates-history',
  },
  [ChainId.arbitrum_rinkeby]: {
    name: 'Arbitrum Rinkeby',
    publicJsonRPCUrl: ['https://rinkeby.arbitrum.io/rpc'],
    publicJsonRPCWSUrl: 'wss://rinkeby.arbitrum.io/rpc',
    // protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum-rinkeby',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://testnet.arbiscan.io',
    // rpcOnly: true,
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
    publicJsonRPCUrl: ['https://arb1.arbitrum.io/rpc'],
    publicJsonRPCWSUrl: 'wss://arb1.arbitrum.io/rpc',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://arbiscan.io',
    // rpcOnly: true,
    // usdMarket: true,
    networkLogoPath: '/icons/networks/arbitrum.svg',
    bridge: {
      icon: '/icons/bridge/arbitrum.svg',
      name: 'Arbitrum Bridge',
      url: 'https://bridge.arbitrum.io',
    },
  },
  [ChainId.harmony]: {
    name: 'Harmony',
    publicJsonRPCUrl: ['https://api.s0.t.hmny.io', 'https://api.harmony.one'],
    publicJsonRPCWSUrl: 'wss://ws.s0.t.hmny.io',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ONE',
    wrappedBaseAssetSymbol: 'WONE',
    baseAssetDecimals: 18,
    explorerLink: 'https://explorer.harmony.one',
    // rpcOnly: true,
    // usdMarket: true,
    networkLogoPath: '/icons/networks/harmony.svg',
    bridge: {
      icon: '/icons/bridge/harmony.svg',
      name: 'Harmony Bridge',
      url: 'https://bridge.harmony.one',
    },
  },
  [ChainId.harmony_testnet]: {
    name: 'Harmony Testnet',
    publicJsonRPCUrl: ['https://api.s0.b.hmny.io', 'https://api.s0.pops.one'],
    publicJsonRPCWSUrl: 'wss://ws.s0.pops.one',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ONE',
    wrappedBaseAssetSymbol: 'WONE',
    baseAssetDecimals: 18,
    explorerLink: 'https://explorer.pops.one',
    // rpcOnly: true,
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/harmony.svg',
    bridge: {
      icon: '/icons/bridge/harmony.svg',
      name: 'Harmony Bridge',
      url: 'https://bridge.harmony.one',
    },
  },
  [ChainId.optimism]: {
    name: 'Optimism',
    publicJsonRPCUrl: ['https://mainnet.optimism.io'],
    publicJsonRPCWSUrl: 'wss://ws-mainnet.optimism.io',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH', // OETH
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://optimistic.etherscan.io',
    // rpcOnly: true,
    // usdMarket: true,
    networkLogoPath: '/icons/networks/optimism.svg',
    bridge: {
      icon: '/icons/bridge/optimism.svg',
      name: 'Optimism Bridge',
      url: 'https://gateway.optimism.io',
    },
  },
  [ChainId.optimism_kovan]: {
    name: 'Optimism Testnet',
    publicJsonRPCUrl: ['https://kovan.optimism.io'],
    publicJsonRPCWSUrl: 'wss://ws-kovan.optimism.io',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH', // KOR
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://kovan-optimistic.etherscan.io',
    // rpcOnly: true,
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/optimism.svg',
    bridge: {
      icon: '/icons/bridge/optimism.svg',
      name: 'Optimism Bridge',
      url: 'https://gateway.optimism.io',
    },
  },
  [ChainId.fantom]: {
    name: 'Fantom',
    publicJsonRPCUrl: ['https://rpc.ftm.tools'],
    publicJsonRPCWSUrl: 'wss://wsapi.fantom.network',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'FTM',
    wrappedBaseAssetSymbol: 'WFTM',
    baseAssetDecimals: 18,
    explorerLink: 'https://ftmscan.com',
    // rpcOnly: true,
    // usdMarket: true,
    networkLogoPath: '/icons/networks/fantom.svg',
    bridge: {
      icon: '/icons/bridge/fantom.svg',
      name: 'Fantom Bridge',
      url: 'https://app.multichain.org/#/router',
    },
  },
  [ChainId.fantom_testnet]: {
    name: 'Fantom Testnet',
    publicJsonRPCUrl: ['https://rpc.testnet.fantom.network'],
    publicJsonRPCWSUrl: '',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'FTM',
    wrappedBaseAssetSymbol: 'WFTM',
    baseAssetDecimals: 18,
    explorerLink: 'https://testnet.ftmscan.com',
    // rpcOnly: true,
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
