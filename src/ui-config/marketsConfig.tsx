import { ChainId } from '@aave/contract-helpers';
import {
  AaveV2Avalanche,
  AaveV2Ethereum,
  AaveV2EthereumAMM,
  AaveV2Fuji,
  AaveV2Goerli,
  AaveV2Mumbai,
  AaveV2Polygon,
  AaveV3Arbitrum,
  // AaveV3ArbitrumGoerli,
  AaveV3Avalanche,
  AaveV3Ethereum,
  AaveV3Fantom,
  // AaveV3FantomTestnet,
  // AaveV3Fuji,
  AaveV3Goerli,
  AaveV3Harmony,
  AaveV3Metis,
  // AaveV3Mumbai,
  AaveV3Optimism,
  // AaveV3OptimismGoerli,
  AaveV3Polygon,
  AaveV3ScrollAlpha,
  // AaveV3Sepolia,
} from '@bgd-labs/aave-address-book';
import { ReactNode } from 'react';

// Enable for premissioned market
// import { PermissionView } from 'src/components/transactions/FlowCommons/PermissionView';

export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  // the network the market operates on
  chainId: ChainId;
  enabledFeatures?: {
    liquiditySwap?: boolean;
    staking?: boolean;
    governance?: boolean;
    faucet?: boolean;
    collateralRepay?: boolean;
    incentives?: boolean;
    permissions?: boolean;
    debtSwitch?: boolean;
  };
  isFork?: boolean;
  permissionComponent?: ReactNode;
  disableCharts?: boolean;
  subgraphUrl?: string;
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    LENDING_POOL: string;
    WETH_GATEWAY?: string;
    SWAP_COLLATERAL_ADAPTER?: string;
    REPAY_WITH_COLLATERAL_ADAPTER?: string;
    DEBT_SWITCH_ADAPTER?: string;
    FAUCET?: string;
    PERMISSION_MANAGER?: string;
    WALLET_BALANCE_PROVIDER: string;
    L2_ENCODER?: string;
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER?: string;
    COLLECTOR?: string;
    V3_MIGRATOR?: string;
    GHO_TOKEN_ADDRESS?: string;
    GHO_UI_DATA_PROVIDER?: string;
  };
  /**
   * https://www.hal.xyz/ has integrated aave for healtfactor warning notification
   * the integration doesn't follow aave market naming & only supports a subset of markets.
   * When a halIntegration is specified a link to hal will be displayed on the ui.
   */
  halIntegration?: {
    URL: string;
    marketName: string;
  };
};

export enum CustomMarket {
  // v3 test networks, all v3.0.1 with permissioned faucet
  proto_arbitrum_goerli_v3 = 'proto_arbitrum_goerli_v3',
  proto_mumbai_v3 = 'proto_mumbai_v3',
  proto_fantom_testnet_v3 = 'proto_fantom_testnet_v3',
  proto_fuji_v3 = 'proto_fuji_v3',
  proto_goerli_v3 = 'proto_goerli_v3',
  proto_optimism_goerli_v3 = 'proto_optimism_goerli_v3',
  proto_scroll_alpha_v3 = 'proto_scroll_alpha_v3',
  proto_sepolia_v3 = 'proto_sepolia_v3',
  // v3 mainnets
  proto_mainnet_v3 = 'proto_mainnet_v3',
  proto_optimism_v3 = 'proto_optimism_v3',
  proto_fantom_v3 = 'proto_fantom_v3',
  proto_harmony_v3 = 'proto_harmony_v3',
  proto_avalanche_v3 = 'proto_avalanche_v3',
  proto_polygon_v3 = 'proto_polygon_v3',
  proto_arbitrum_v3 = 'proto_arbitrum_v3',
  proto_metis_v3 = 'proto_metis_v3',
  // v2
  proto_mainnet = 'proto_mainnet',
  proto_avalanche = 'proto_avalanche',
  proto_fuji = 'proto_fuji',
  proto_polygon = 'proto_polygon',
  proto_mumbai = 'proto_mumbai',
  amm_mainnet = 'amm_mainnet',
  proto_goerli = 'proto_goerli',
  // external
  // permissioned_market = 'permissioned_market',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_mainnet_v3]: {
    marketTitle: 'Ethereum',
    chainId: ChainId.mainnet,
    v3: true,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: true,
      collateralRepay: true,
      incentives: true,
      debtSwitch: false,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Ethereum.POOL,
      WETH_GATEWAY: AaveV3Ethereum.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV3Ethereum.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV3Ethereum.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Ethereum.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Ethereum.COLLECTOR,
      GHO_TOKEN_ADDRESS: AaveV3Ethereum.GHO_TOKEN,
      GHO_UI_DATA_PROVIDER: AaveV3Ethereum.UI_GHO_DATA_PROVIDER,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-v3-track-health-factor',
      marketName: 'aavev3',
    },
  },
  [CustomMarket.proto_mainnet]: {
    marketTitle: 'Ethereum',
    chainId: ChainId.mainnet,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: true,
      collateralRepay: true,
      incentives: true,
      debtSwitch: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2Ethereum.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2Ethereum.POOL,
      WETH_GATEWAY: AaveV2Ethereum.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV2Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV2Ethereum.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV2Ethereum.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2Ethereum.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2Ethereum.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV2Ethereum.COLLECTOR,
      V3_MIGRATOR: AaveV2Ethereum.MIGRATION_HELPER,
      DEBT_SWITCH_ADAPTER: AaveV2Ethereum.DEBT_SWAP_ADAPTER,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
      marketName: 'aavev2',
    },
  },
  // [CustomMarket.permissioned_market]: {
  //   marketTitle: 'Ethereum Permissioned Market example',
  //   chainId: ChainId.mainnet,
  //   enabledFeatures: {
  //     // liquiditySwap: true,
  //     // collateralRepay: true,
  //     // incentives: true,
  //     permissions: true,
  //   },
  //   permissionComponent: <PermissionView />,
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: markets..POOL_ADDRESSES_PROVIDER,
  //     LENDING_POOL: markets..POOL,
  //     WETH_GATEWAY: markets..WETH_GATEWAY,
  //     // REPAY_WITH_COLLATERAL_ADAPTER: markets..REPAY_WITH_COLLATERAL_ADAPTER,
  //     // SWAP_COLLATERAL_ADAPTER: markets..SWAP_COLLATERAL_ADAPTER,
  //     WALLET_BALANCE_PROVIDER: markets..WALLET_BALANCE_PROVIDER,
  //     UI_POOL_DATA_PROVIDER: markets..UI_POOL_DATA_PROVIDER,
  //     // UI_INCENTIVE_DATA_PROVIDER: markets..UI_INCENTIVE_DATA_PROVIDER,
  //     PERMISSION_MANAGER: '<address here>',
  //   },
  // },
  [CustomMarket.amm_mainnet]: {
    marketTitle: 'Ethereum AMM',
    chainId: ChainId.mainnet,
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2EthereumAMM.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2EthereumAMM.POOL,
      WETH_GATEWAY: AaveV2EthereumAMM.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: AaveV2EthereumAMM.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2EthereumAMM.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2EthereumAMM.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV2EthereumAMM.COLLECTOR,
      V3_MIGRATOR: AaveV2EthereumAMM.MIGRATION_HELPER,
    },
  },
  [CustomMarket.proto_polygon]: {
    marketTitle: 'Polygon',
    chainId: ChainId.polygon,
    enabledFeatures: {
      liquiditySwap: true,
      incentives: true,
      collateralRepay: true,
      debtSwitch: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2Polygon.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2Polygon.POOL,
      WETH_GATEWAY: AaveV2Polygon.WETH_GATEWAY,
      SWAP_COLLATERAL_ADAPTER: AaveV2Polygon.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV2Polygon.REPAY_WITH_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV2Polygon.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2Polygon.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2Polygon.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV2Polygon.COLLECTOR,
      V3_MIGRATOR: AaveV2Polygon.MIGRATION_HELPER,
      DEBT_SWITCH_ADAPTER: AaveV2Polygon.DEBT_SWAP_ADAPTER,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
      marketName: 'aavepolygon',
    },
  },
  [CustomMarket.proto_avalanche]: {
    marketTitle: 'Avalanche',
    chainId: ChainId.avalanche,
    enabledFeatures: {
      liquiditySwap: true,
      incentives: true,
      collateralRepay: true,
      debtSwitch: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-avalanche',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2Avalanche.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2Avalanche.POOL,
      WETH_GATEWAY: AaveV2Avalanche.WETH_GATEWAY,
      SWAP_COLLATERAL_ADAPTER: AaveV2Avalanche.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV2Avalanche.REPAY_WITH_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV2Avalanche.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2Avalanche.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2Avalanche.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV2Avalanche.COLLECTOR,
      V3_MIGRATOR: AaveV2Avalanche.MIGRATION_HELPER,
      DEBT_SWITCH_ADAPTER: AaveV2Avalanche.DEBT_SWAP_ADAPTER,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
      marketName: 'aaveavalanche',
    },
  },
  // v3
  [CustomMarket.proto_sepolia_v3]: {
    marketTitle: 'Ethereum Sepolia',
    v3: true,
    chainId: ChainId.sepolia,
    enabledFeatures: {
      faucet: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A', // AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', //AaveV3Sepolia.POOL,
      WETH_GATEWAY: '0x387d311e47e80b498169e6fb51d3193167d89F7D', // AaveV3Sepolia.WETH_GATEWAY,
      FAUCET: '0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D', // AaveV3Sepolia.FAUCET,
      WALLET_BALANCE_PROVIDER: '0xCD4e0d6D2b1252E2A709B8aE97DBA31164C5a709', // AaveV3Sepolia.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: '0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE', // AaveV3Sepolia.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: '0xBA25de9a7DC623B30799F33B770d31B44c2C3b77', // AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
  [CustomMarket.proto_goerli_v3]: {
    marketTitle: 'Ethereum Görli',
    v3: true,
    chainId: ChainId.goerli,
    enabledFeatures: {
      faucet: true,
    },
    // subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-goerli', needs re-deployment
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Goerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Goerli.POOL,
      WETH_GATEWAY: AaveV3Goerli.WETH_GATEWAY,
      FAUCET: AaveV3Goerli.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3Goerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Goerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Goerli.UI_INCENTIVE_DATA_PROVIDER,
    },
  },

  [CustomMarket.proto_arbitrum_v3]: {
    marketTitle: 'Arbitrum',
    v3: true,
    chainId: ChainId.arbitrum_one,
    enabledFeatures: {
      incentives: true,
      liquiditySwap: true,
      collateralRepay: true,
      debtSwitch: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Arbitrum.POOL,
      WETH_GATEWAY: AaveV3Arbitrum.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: AaveV3Arbitrum.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Arbitrum.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3Arbitrum.L2_ENCODER,
      COLLECTOR: AaveV3Arbitrum.COLLECTOR,
      SWAP_COLLATERAL_ADAPTER: AaveV3Arbitrum.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3Arbitrum.REPAY_WITH_COLLATERAL_ADAPTER,
      DEBT_SWITCH_ADAPTER: AaveV3Arbitrum.DEBT_SWAP_ADAPTER,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-v3-track-health-factor',
      marketName: 'arbitrum',
    },
  },
  [CustomMarket.proto_arbitrum_goerli_v3]: {
    marketTitle: 'Arbitrum Görli',
    v3: true,
    chainId: ChainId.arbitrum_goerli,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    //subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum-goerli',  needs re-deployment
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xD64dDe119f11C88850FD596BE11CE398CC5893e6', // AaveV3ArbitrumGoerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: '0x20fa38a4f8Af2E36f1Cc14caad2E603fbA5C535c', // AaveV3ArbitrumGoerli.POOL,
      WETH_GATEWAY: '0xcD1065F2c3A0e0a94d543Ce41720BFF515f753B7', // AaveV3ArbitrumGoerli.WETH_GATEWAY,
      FAUCET: '0xc1b3cc37cf2f922abDFE7F01A17bc932F4078665', // AaveV3ArbitrumGoerli.FAUCET,
      WALLET_BALANCE_PROVIDER: '0x8c7914af3926CfA5131Ce294c48E03C6d3aDc916', // AaveV3ArbitrumGoerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: '0x1d5a0287E4ac7Ff805D8399D0177c75C8C95d4dC', // AaveV3ArbitrumGoerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: '0x159E642e34ad712242F6057477277b093eb43950', // AaveV3ArbitrumGoerli.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: '0x46605375317C3E8bd19E0ED70987354Cb6D16720', // AaveV3ArbitrumGoerli.L2_ENCODER,
    },
  },
  [CustomMarket.proto_avalanche_v3]: {
    marketTitle: 'Avalanche',
    v3: true,
    chainId: ChainId.avalanche,
    enabledFeatures: {
      liquiditySwap: true,
      incentives: true,
      collateralRepay: true,
      debtSwitch: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-avalanche',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Avalanche.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Avalanche.POOL,
      WETH_GATEWAY: AaveV3Avalanche.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3Avalanche.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV3Avalanche.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV3Avalanche.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Avalanche.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Avalanche.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Avalanche.COLLECTOR,
      DEBT_SWITCH_ADAPTER: AaveV3Avalanche.DEBT_SWAP_ADAPTER,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-v3-track-health-factor',
      marketName: 'avalanche',
    },
  },
  [CustomMarket.proto_fuji_v3]: {
    marketTitle: 'Avalanche Fuji',
    v3: true,
    chainId: ChainId.fuji,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    //  subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-fuji',  needs re-deployment
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xfb87056c0587923f15EB0aABc7d0572450Cc8003', // AaveV3Fuji.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: '0xccEa5C65f6d4F465B71501418b88FBe4e7071283', // AaveV3Fuji.POOL,
      WETH_GATEWAY: '0x8A007E495449ffeda4C2d65f14eE31f8Bcb022CF', // AaveV3Fuji.WETH_GATEWAY,
      FAUCET: '0xBCcD21ae43139bEF545e72e20E78f039A3Ac1b96', // AaveV3Fuji.FAUCET,
      WALLET_BALANCE_PROVIDER: '0xfFE3778c51e93EBf68f5d0a83c794E7f623024dd', // AaveV3Fuji.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: '0x279c790Afcd547e2f20d896c5DDEe3846b9790B5', // AaveV3Fuji.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: '0x1EFf285a4E34217495b5531151bffa222A94A4F9', // AaveV3Fuji.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
  [CustomMarket.proto_optimism_goerli_v3]: {
    marketTitle: 'Optimism Görli',
    v3: true,
    chainId: ChainId.optimism_goerli,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    // subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-optimism-goerli',  needs re-deployment
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xf3a4595bD9FBf129DEb80802a4785873F0ceB65c', // AaveV3OptimismGoerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: '0x52dCE39f4A3823b335732178364f5590bDacb25D', // AaveV3OptimismGoerli.POOL,
      WETH_GATEWAY: '0xf556C102F47d806E21E8E78438E58ac06A14A29E', // AaveV3OptimismGoerli.WETH_GATEWAY,
      FAUCET: '0x387d311e47e80b498169e6fb51d3193167d89F7D', // AaveV3OptimismGoerli.FAUCET,
      WALLET_BALANCE_PROVIDER: '0x56033E114c61183590d39BA847400F02022Ebe47', // AaveV3OptimismGoerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: '0xD2f5680976c86ADd3978b7ad3422Ee5c7690ddb4', // AaveV3OptimismGoerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: '0x72A9c57cD5E2Ff20450e409cF6A542f1E6c710fc', // AaveV3OptimismGoerli.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: '0x19cdecE64EDE475ba0EB114ff4E319d64Ef8ECCf', // AaveV3OptimismGoerli.L2_ENCODER,
    },
  },
  [CustomMarket.proto_scroll_alpha_v3]: {
    marketTitle: 'Scroll Alpha Görli',
    v3: true,
    chainId: ChainId.scroll_alpha,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3ScrollAlpha.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3ScrollAlpha.POOL,
      WETH_GATEWAY: AaveV3ScrollAlpha.WETH_GATEWAY,
      FAUCET: AaveV3ScrollAlpha.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3ScrollAlpha.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3ScrollAlpha.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3ScrollAlpha.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3ScrollAlpha.L2_ENCODER,
    },
  },
  [CustomMarket.proto_fantom_v3]: {
    marketTitle: 'Fantom',
    v3: true,
    chainId: ChainId.fantom,
    enabledFeatures: {
      incentives: true,
      collateralRepay: true,
      liquiditySwap: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-fantom',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Fantom.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Fantom.POOL,
      WETH_GATEWAY: AaveV3Fantom.WETH_GATEWAY,
      SWAP_COLLATERAL_ADAPTER: AaveV3Fantom.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3Fantom.REPAY_WITH_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV3Fantom.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Fantom.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Fantom.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Fantom.COLLECTOR,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-v3-track-health-factor',
      marketName: 'fantom',
    },
  },
  [CustomMarket.proto_fantom_testnet_v3]: {
    marketTitle: 'Fantom Testnet',
    v3: true,
    chainId: ChainId.fantom_testnet,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    // subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-fantom-testnet',  needs re-deployment
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x1558c6FadDe1bEaf0f6628BDd1DFf3461185eA24', // AaveV3FantomTestnet.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: '0x56Ab717d882F7A8d4a3C2b191707322c5Cc70db8', // AaveV3FantomTestnet.POOL,
      WETH_GATEWAY: '0xd2B0C9778d088Fc79C28Da719bC02158E64796bD', // AaveV3FantomTestnet.WETH_GATEWAY,
      FAUCET: '0x021BE22Bdfa497D6643D4035E530095E7b452967', // AaveV3FantomTestnet.FAUCET,
      WALLET_BALANCE_PROVIDER: '0x49cC86071dEcC7999BA656763b8389f23058bB34', // AaveV3FantomTestnet.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: '0xC91dB4F736b6Acf5A2e379a58280D1b06BD24E7d', // AaveV3FantomTestnet.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: '0xf24dc19cFb9A25bbc4DDcaAdb116DfD17472207B', // AaveV3FantomTestnet.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
  [CustomMarket.proto_harmony_v3]: {
    marketTitle: 'Harmony',
    v3: true,
    chainId: ChainId.harmony,
    enabledFeatures: {
      incentives: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-harmony',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Harmony.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Harmony.POOL,
      WETH_GATEWAY: AaveV3Harmony.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: AaveV3Harmony.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Harmony.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Harmony.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Harmony.COLLECTOR,
    },
  },
  [CustomMarket.proto_optimism_v3]: {
    marketTitle: 'Optimism',
    v3: true,
    chainId: ChainId.optimism,
    enabledFeatures: {
      incentives: true,
      collateralRepay: true,
      liquiditySwap: true,
      debtSwitch: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-optimism',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Optimism.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Optimism.POOL,
      WETH_GATEWAY: AaveV3Optimism.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: AaveV3Optimism.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Optimism.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Optimism.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3Optimism.L2_ENCODER,
      COLLECTOR: AaveV3Optimism.COLLECTOR,
      SWAP_COLLATERAL_ADAPTER: AaveV3Optimism.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3Optimism.REPAY_WITH_COLLATERAL_ADAPTER,
      DEBT_SWITCH_ADAPTER: AaveV3Optimism.DEBT_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_polygon_v3]: {
    marketTitle: 'Polygon',
    chainId: ChainId.polygon,
    v3: true,
    enabledFeatures: {
      liquiditySwap: true,
      incentives: true,
      collateralRepay: true,
      debtSwitch: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-polygon',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Polygon.POOL,
      WETH_GATEWAY: AaveV3Polygon.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3Polygon.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV3Polygon.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV3Polygon.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Polygon.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Polygon.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Polygon.COLLECTOR,
      DEBT_SWITCH_ADAPTER: AaveV3Polygon.DEBT_SWAP_ADAPTER,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-v3-track-health-factor',
      marketName: 'polygon',
    },
  },
  [CustomMarket.proto_mumbai_v3]: {
    marketTitle: 'Polygon Mumbai',
    chainId: ChainId.mumbai,
    enabledFeatures: {
      incentives: true,
      faucet: true,
    },
    //  subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-mumbai',  needs re-deployment
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x4CeDCB57Af02293231BAA9D39354D6BFDFD251e0', // AaveV3Mumbai.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: '0xcC6114B983E4Ed2737E9BD3961c9924e6216c704', // AaveV3Mumbai.POOL,
      WETH_GATEWAY: '0x8dA9412AbB78db20d0B496573D9066C474eA21B8', // AaveV3Mumbai.WETH_GATEWAY,
      FAUCET: '0x2c95d10bA4BBEc79e562e8B3f48687751808C925', // AaveV3Mumbai.FAUCET,
      WALLET_BALANCE_PROVIDER: '0xD8A70FC58BC069CFE6529EBF0c1Db067f2b5347E', // AaveV3Mumbai.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: '0xD64dDe119f11C88850FD596BE11CE398CC5893e6', // AaveV3Mumbai.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: '0x322bCff7b69F832B1a1F56E6BC600C9229CFb907', // AaveV3Mumbai.UI_INCENTIVE_DATA_PROVIDER,
    },
    v3: true,
  },
  [CustomMarket.proto_goerli]: {
    marketTitle: 'Ethereum Görli',
    chainId: ChainId.goerli,
    enabledFeatures: {
      faucet: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-goerli',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2Goerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2Goerli.POOL,
      WETH_GATEWAY: AaveV2Goerli.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: AaveV2Goerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2Goerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2Goerli.UI_INCENTIVE_DATA_PROVIDER,
      FAUCET: AaveV2Goerli.FAUCET,
    },
  },
  [CustomMarket.proto_mumbai]: {
    marketTitle: 'Polygon Mumbai',
    chainId: ChainId.mumbai,
    enabledFeatures: {
      incentives: true,
      faucet: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-polygon-mumbai',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2Mumbai.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2Mumbai.POOL,
      WETH_GATEWAY: AaveV2Mumbai.WETH_GATEWAY,
      FAUCET: AaveV2Mumbai.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV2Mumbai.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2Mumbai.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2Mumbai.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
  [CustomMarket.proto_fuji]: {
    marketTitle: 'Avalanche Fuji',
    chainId: ChainId.fuji,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-fuji',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2Fuji.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2Fuji.POOL,
      WETH_GATEWAY: AaveV2Fuji.WETH_GATEWAY,
      FAUCET: AaveV2Fuji.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV2Fuji.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2Fuji.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2Fuji.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
  [CustomMarket.proto_metis_v3]: {
    marketTitle: 'Metis',
    chainId: ChainId.metis_andromeda,
    v3: true,
    enabledFeatures: {
      incentives: true,
    },
    subgraphUrl: 'https://andromeda.thegraph.metis.io/subgraphs/name/aave/protocol-v3-metis',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Metis.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Metis.POOL,
      WETH_GATEWAY: '0x0', // not applicable for Metis
      WALLET_BALANCE_PROVIDER: AaveV3Metis.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Metis.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Metis.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Metis.COLLECTOR,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-v3-track-health-factor',
      marketName: 'polygon',
    },
  },
} as const;
