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
  [ChainId.goerli]: {
    name: 'Ethereum Görli',
    publicJsonRPCUrl: ['https://eth-goerli.alchemyapi.io/v2/demo', 'https://goerli.prylabs.net'],
    publicJsonRPCWSUrl: 'wss://eth-goerli.alchemyapi.io/v2/demo',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://goerli.etherscan.io',
    // rpcOnly: true,
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/ethereum.svg',
  },
  [ChainId.mainnet]: {
    name: 'Ethereum',
    privateJsonRPCUrl: 'https://eth-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: ['https://cloudflare-eth.com/v1/mainnet'],
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
    privateJsonRPCUrl: 'https://poly-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [], // 'https://polygon-rpc.com'
    // publicJsonRPCWSUrl: 'wss://polygon-rpc.com',
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
    publicJsonRPCUrl: ['https://polygon-mumbai.g.alchemy.com/v2/demo'],
    publicJsonRPCWSUrl: 'wss://polygon-mumbai.g.alchemy.com/v2/demo',
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
    name: 'Avalanche Fuji',
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
    privateJsonRPCUrl:
      'https://avax-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca/ext/bc/C/rpc',
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
  [ChainId.arbitrum_goerli]: {
    name: 'Arbitrum Görli',
    publicJsonRPCUrl: ['https://goerli-rollup.arbitrum.io/rpc'],
    publicJsonRPCWSUrl: 'wss://goerli-rollup.arbitrum.io/rpc',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://goerli-rollup-explorer.arbitrum.io',
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
    privateJsonRPCUrl: 'https://harmony-0.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
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
  [ChainId.optimism]: {
    name: 'Optimism',
    privateJsonRPCUrl:
      'https://optimism-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: ['https://optimism-mainnet.public.blastapi.io'],
    publicJsonRPCWSUrl: 'wss://optimism-mainnet.public.blastapi.io',
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
      url: 'https://app.optimism.io/bridge',
    },
  },
  [ChainId.optimism_goerli]: {
    name: 'Optimism Görli',
    publicJsonRPCUrl: ['https://goerli.optimism.io'],
    publicJsonRPCWSUrl: 'wss://goerli.optimism.io',
    // protocolDataUrl: '',
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://l2-explorer.surge.sh',
    // rpcOnly: true,
    // usdMarket: true,
    isTestnet: true,
    networkLogoPath: '/icons/networks/optimism.svg',
    // bridge: {
    //   icon: '/icons/bridge/optimism.svg',
    //   name: 'Optimism Bridge',
    //   url: 'https://app.optimism.io/bridge',
    // },
  },
  [ChainId.fantom]: {
    name: 'Fantom',
    privateJsonRPCUrl: 'https://fantom-mainnet.gateway.pokt.network/v1/lb/62b3314e123e6f00397f19ca',
    publicJsonRPCUrl: [], // 'https://rpc.ftm.tools' compromised
    // publicJsonRPCWSUrl: 'wss://wsapi.fantom.network',
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
