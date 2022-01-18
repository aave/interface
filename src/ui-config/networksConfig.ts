import polygonBridgeLogo from "./icons/polygonLogo.svg";
import avalancheBridgeLogo from "./icons/avalancheLogo.svg";
import arbitrumBridgeLogo from "./icons/arbitrumLogo.svg";
import { ChainId } from "@aave/contract-helpers";

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
  protocolDataUrl: string;
  // https://github.com/aave/aave-api
  ratesHistoryApiUrl?: string;
  cachingServerUrl?: string;
  cachingWSServerUrl?: string;
  baseUniswapAdapter?: string;
  /**
   * When this is set withdrawals will automatically be unwrapped
   */
  wrappedBaseAssetSymbol?: string;
  baseAssetSymbol: string;
  // needed for configuring the chain on metemask when it doesn't exist yet
  baseAssetDecimals: number;
  usdMarket?: boolean;
  // function returning a link to etherscan et al
  explorerLink: string;
  explorerLinkBuilder: (props: ExplorerLinkBuilderProps) => string;
  rpcOnly?: boolean;
  // set this to show faucets and similar
  isTestnet?: boolean;
  // get's automatically populated on fork networks
  isFork?: boolean;
  // contains the forked off chainId
  underlyingChainId?: number;
  bridge?: {
    brandColor: string;
    name: string;
    url: string;
    logo: string;
  };
};

export type BaseNetworkConfig = Omit<NetworkConfig, "explorerLinkBuilder">;

export const networkConfigs: Record<string, BaseNetworkConfig> = {
  [ChainId.kovan]: {
    name: "Kovan",
    publicJsonRPCUrl: [
      "https://eth-kovan.alchemyapi.io/v2/demo",
      "https://kovan.poa.network",
    ],
    protocolDataUrl:
      "https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan",
    baseUniswapAdapter: "0xf86Be05f535EC2d217E4c6116B3fa147ee5C05A1",
    baseAssetSymbol: "ETH",
    wrappedBaseAssetSymbol: "WETH",
    baseAssetDecimals: 18,
    explorerLink: "https://kovan.etherscan.io",
    rpcOnly: true,
    isTestnet: true,
  },
  [ChainId.rinkeby]: {
    name: "Rinkeby",
    publicJsonRPCUrl: [
      "https://eth-rinkeby.alchemyapi.io/v2/demo",
      "https://rinkeby-light.eth.linkpool.io/",
    ],
    protocolDataUrl: "",
    baseUniswapAdapter: "",
    baseAssetSymbol: "ETH",
    wrappedBaseAssetSymbol: "WETH",
    baseAssetDecimals: 18,
    explorerLink: "https://rinkeby.etherscan.io/",
    rpcOnly: true,
    isTestnet: true,
  },
  [ChainId.mainnet]: {
    name: "Ethereum mainnet",
    publicJsonRPCUrl: [
      "https://cloudflare-eth.com",
      "https://eth-mainnet.alchemyapi.io/v2/demo",
    ],
    publicJsonRPCWSUrl: "wss://eth-mainnet.alchemyapi.io/v2/demo",
    cachingServerUrl: "https://cache-api-1.aave.com/graphql",
    cachingWSServerUrl: "wss://cache-api-1.aave.com/graphql",
    protocolDataUrl: "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
    baseUniswapAdapter: "0xc3efa200a60883a96ffe3d5b492b121d6e9a1f3f",
    baseAssetSymbol: "ETH",
    wrappedBaseAssetSymbol: "WETH",
    baseAssetDecimals: 18,
    explorerLink: "https://etherscan.io",
    rpcOnly: false,
    ratesHistoryApiUrl: "https://aave-api-v2.aave.com/data/rates-history",
  },
  [ChainId.polygon]: {
    name: "Polygon POS",
    publicJsonRPCUrl: ["https://polygon-rpc.com"],
    publicJsonRPCWSUrl: "wss://polygon-rpc.com",
    cachingServerUrl: "https://cache-api-137.aave.com/graphql",
    cachingWSServerUrl: "wss://cache-api-137.aave.com/graphql",
    protocolDataUrl:
      "https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic",
    baseAssetSymbol: "MATIC",
    wrappedBaseAssetSymbol: "WMATIC",
    baseAssetDecimals: 18,
    explorerLink: "https://polygonscan.com",
    bridge: {
      brandColor: "130, 71, 229",
      name: "Polygon PoS Bridge",
      url: "https://wallet.matic.network/bridge/",
      logo: polygonBridgeLogo,
    },
    ratesHistoryApiUrl: "https://aave-api-v2.aave.com/data/rates-history",
  },
  [ChainId.mumbai]: {
    name: "Mumbai",
    publicJsonRPCUrl: ["https://rpc-mumbai.maticvigil.com"],
    publicJsonRPCWSUrl: "wss://rpc-mumbai.maticvigil.com",
    protocolDataUrl:
      "https://api.thegraph.com/subgraphs/name/aave/aave-v2-polygon-mumbai",
    baseAssetSymbol: "MATIC",
    wrappedBaseAssetSymbol: "WMATIC",
    baseAssetDecimals: 18,
    explorerLink: "https://explorer-mumbai.maticvigil.com",
    rpcOnly: true,
    isTestnet: true,
  },
  [ChainId.fuji]: {
    name: "Fuji",
    publicJsonRPCUrl: ["https://api.avax-test.network/ext/bc/C/rpc"],
    publicJsonRPCWSUrl: "wss://api.avax-test.network/ext/bc/C/rpc",
    protocolDataUrl:
      "https://api.thegraph.com/subgraphs/name/aave/protocol-v2-fuji",
    baseUniswapAdapter: "0x0",
    baseAssetSymbol: "AVAX",
    wrappedBaseAssetSymbol: "WAVAX",
    baseAssetDecimals: 18,
    explorerLink: "https://cchain.explorer.avax-test.network",
    rpcOnly: true,
    usdMarket: true,
    isTestnet: true,
    bridge: {
      brandColor: "232, 65, 66",
      name: "Avalanche Bridge",
      url: "https://bridge.avax.network/",
      logo: avalancheBridgeLogo,
    },
  },
  [ChainId.avalanche]: {
    name: "Avalanche",
    publicJsonRPCUrl: ["https://api.avax.network/ext/bc/C/rpc"],
    publicJsonRPCWSUrl: "wss://api.avax.network/ext/bc/C/rpc",
    protocolDataUrl:
      "https://api.thegraph.com/subgraphs/name/aave/protocol-v2-avalanche",
    cachingServerUrl: "https://cache-api-43114.aave.com/graphql",
    cachingWSServerUrl: "wss://cache-api-43114.aave.com/graphql",
    baseUniswapAdapter: "0x0",
    baseAssetSymbol: "AVAX",
    wrappedBaseAssetSymbol: "WAVAX",
    baseAssetDecimals: 18,
    explorerLink: "https://cchain.explorer.avax.network",
    rpcOnly: false,
    usdMarket: true,
    bridge: {
      brandColor: "232, 65, 66",
      name: "Avalanche Bridge",
      url: "https://bridge.avax.network/",
      logo: avalancheBridgeLogo,
    },
    ratesHistoryApiUrl: "https://aave-api-v2.aave.com/data/rates-history",
  },
  [ChainId.arbitrum_rinkeby]: {
    name: "Arbitrum Rinkeby",
    publicJsonRPCUrl: ["https://rinkeby.arbitrum.io/rpc"],
    publicJsonRPCWSUrl: "wss://rinkeby.arbitrum.io/rpc",
    protocolDataUrl:
      "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum-rinkeby",
    baseUniswapAdapter: "0x0",
    baseAssetSymbol: "ARETH",
    baseAssetDecimals: 18,
    explorerLink: "https://testnet.arbiscan.io/",
    rpcOnly: true,
    usdMarket: true,
    isTestnet: true,
    bridge: {
      brandColor: "40, 160, 239",
      name: "Arbitrum Bridge",
      url: "https://bridge.arbitrum.io",
      logo: arbitrumBridgeLogo,
    },
  },
} as const;
