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
  AaveV3ArbitrumGoerli,
  AaveV3Avalanche,
  AaveV3Ethereum,
  AaveV3Fantom,
  AaveV3FantomTestnet,
  AaveV3Fuji,
  AaveV3Goerli,
  AaveV3Harmony,
  AaveV3Metis,
  AaveV3Mumbai,
  AaveV3Optimism,
  AaveV3OptimismGoerli,
  AaveV3Polygon,
  AaveV3ScrollAlpha,
  AaveV3Sepolia,
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
    FAUCET?: string;
    PERMISSION_MANAGER?: string;
    WALLET_BALANCE_PROVIDER: string;
    L2_ENCODER?: string;
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER?: string;
    COLLECTOR?: string;
    V3_MIGRATOR?: string;
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
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Sepolia.POOL,
      WETH_GATEWAY: AaveV3Sepolia.WETH_GATEWAY,
      FAUCET: AaveV3Sepolia.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3Sepolia.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Sepolia.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER,
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
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3ArbitrumGoerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3ArbitrumGoerli.POOL,
      WETH_GATEWAY: AaveV3ArbitrumGoerli.WETH_GATEWAY,
      FAUCET: AaveV3ArbitrumGoerli.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3ArbitrumGoerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3ArbitrumGoerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3ArbitrumGoerli.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3ArbitrumGoerli.L2_ENCODER,
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
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Fuji.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Fuji.POOL,
      WETH_GATEWAY: AaveV3Fuji.WETH_GATEWAY,
      FAUCET: AaveV3Fuji.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3Fuji.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Fuji.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Fuji.UI_INCENTIVE_DATA_PROVIDER,
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
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3OptimismGoerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3OptimismGoerli.POOL,
      WETH_GATEWAY: AaveV3OptimismGoerli.WETH_GATEWAY,
      FAUCET: AaveV3OptimismGoerli.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3OptimismGoerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3OptimismGoerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3OptimismGoerli.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3OptimismGoerli.L2_ENCODER,
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
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3FantomTestnet.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3FantomTestnet.POOL,
      WETH_GATEWAY: AaveV3FantomTestnet.WETH_GATEWAY,
      FAUCET: AaveV3FantomTestnet.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3FantomTestnet.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3FantomTestnet.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3FantomTestnet.UI_INCENTIVE_DATA_PROVIDER,
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
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Mumbai.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Mumbai.POOL,
      WETH_GATEWAY: AaveV3Mumbai.WETH_GATEWAY,
      FAUCET: AaveV3Mumbai.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3Mumbai.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Mumbai.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Mumbai.UI_INCENTIVE_DATA_PROVIDER,
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
