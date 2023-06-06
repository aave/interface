import { ChainId } from '@aave/contract-helpers';
// import * as markets from '@bgd-labs/aave-address-book';
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
  addresses: {
    MERKLE_DIST?: string;
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
    STAKING_DATA_PROVIDER?: string;
    MASTER_CHEF?: string;
    LP_TOKEN?: string;
    PAW_TOKEN?: string;
    PAW_PRICE_ORACLE?: string;
    PRICE_ORACLE?: string;
    LENDING_PROTOCOL_DATA_PROVIDER?: string;
    CHEF_INCENTIVES_CONTROLLER?: string;
    EARLY_TOKEN_GENERATION?: string;
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
  /*
  proto_arbitrum_goerli_v3 = 'proto_arbitrum_goerli_v3',
  proto_mumbai_v3 = 'proto_mumbai_v3',
  proto_fantom_testnet_v3 = 'proto_fantom_testnet_v3',
  proto_fuji_v3 = 'proto_fuji_v3',
  proto_goerli_v3 = 'proto_goerli_v3',
  proto_optimism_goerli_v3 = 'proto_optimism_goerli_v3',
  */

  // v3 mainnets
  bsc_testnet_v3 = 'bsc_testnet_v3',

  /*
  proto_mainnet_v3 = 'proto_mainnet_v3',
  proto_optimism_v3 = 'proto_optimism_v3',
  proto_fantom_v3 = 'proto_fantom_v3',
  proto_harmony_v3 = 'proto_harmony_v3',
  proto_avalanche_v3 = 'proto_avalanche_v3',
  proto_polygon_v3 = 'proto_polygon_v3',
  proto_arbitrum_v3 = 'proto_arbitrum_v3',
  // proto_ethereum_v3_1 = 'proto_ethereum_v3_1',
  */

  // v2

  // proto_mainnet = 'proto_mainnet',
  /*
  proto_avalanche = 'proto_avalanche',
  proto_fuji = 'proto_fuji',
  proto_polygon = 'proto_polygon',
  proto_mumbai = 'proto_mumbai',
  amm_mainnet = 'amm_mainnet',
  proto_goerli = 'proto_goerli',
  */
  // external
  // permissioned_market = 'permissioned_market',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  // Old Deployment
  // [CustomMarket.bsc_testnet_v3]: {
  //   v3: true,
  //   marketTitle: 'BSC',
  //   chainId: 97,
  //   enabledFeatures: {},
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: '0xbBFC6b0189a127D4DC7F891CD9E528E0B75e32f5',
  //     LENDING_POOL: '0xB5cfcD7E73634460D06bFc4f6059962d079567a7',
  //     WETH_GATEWAY: '0xb3322833eD4e52b7B9a83d6Dc71C6a6D1B3464E5',
  //     SWAP_COLLATERAL_ADAPTER: '',
  //     REPAY_WITH_COLLATERAL_ADAPTER: '',
  //     FAUCET: '',
  //     PERMISSION_MANAGER: '',
  //     WALLET_BALANCE_PROVIDER: '0x517766582B8159F9C378FF047d1448C2Bf4Da5Ff',
  //     L2_ENCODER: '',
  //     UI_POOL_DATA_PROVIDER: '0xa35B1B57ab6D7cCF102dcCFFCE9A05a86C0450D3',
  //     UI_INCENTIVE_DATA_PROVIDER: '0x12B2750cebF9f8B321349cf79fED70429d358Fd2',
  //     COLLECTOR: '0x4dcF1f04F9Bf5f13727C5CFD1d961ccae5A88714',
  //     V3_MIGRATOR: '',
  //   },
  // },
  // // Second deployment with MultiFeeDistribution attached
  // [CustomMarket.bsc_testnet_v3]: {
  //   v3: true,
  //   marketTitle: 'BSC',
  //   chainId: 97,
  //   enabledFeatures: {},
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: '0x0edc28BbDD6340242b52dF947b0Af01B1e6FD990',
  //     LENDING_POOL: '0xE6D96BBc1D94dc0342929986c6D33A94E7078d4d',
  //     WETH_GATEWAY: '0xB584639001B1d628925Afe12F47fd66fb8Cf830C',
  //     SWAP_COLLATERAL_ADAPTER: '',
  //     REPAY_WITH_COLLATERAL_ADAPTER: '',
  //     FAUCET: '',
  //     PERMISSION_MANAGER: '',
  //     WALLET_BALANCE_PROVIDER: '0x1140774F9beF7143BD5DD4F8121dc1d95B71C6F0',
  //     L2_ENCODER: '',
  //     UI_POOL_DATA_PROVIDER: '0xe253d6f5F84eC49655d8844Fc7AD1921BFb76642',
  //     UI_INCENTIVE_DATA_PROVIDER: '0x17A26446addc32C7c19F00aCe93Dd0c6026d62DF',
  //     COLLECTOR: '0x0BaeB79ffBf6CA1652bAeeeB979641bEE68Cebb9',
  //     V3_MIGRATOR: '',
  //   },
  // },
  // //@Third Deployment
  // [CustomMarket.bsc_testnet_v3]: {
  //   v3: true,
  //   marketTitle: 'BSC',
  //   chainId: 97,
  //   enabledFeatures: {},
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: '0x3FAbBFae42c365699b7dB355fdCeBb2b8761C01F',
  //     LENDING_POOL: '0x26b0A7fEa02F55dC7D38913b5C55519Be171895A',
  //     WETH_GATEWAY: '0xc4378Ad54224AcCFD31E3f1d0C3FDd50Afa7C327',
  //     SWAP_COLLATERAL_ADAPTER: '',
  //     REPAY_WITH_COLLATERAL_ADAPTER: '',
  //     FAUCET: '',
  //     PERMISSION_MANAGER: '',
  //     WALLET_BALANCE_PROVIDER: '0x54e7a16fC56F06819318652e2234728bE1f6fdBd',
  //     L2_ENCODER: '',
  //     UI_POOL_DATA_PROVIDER: '0xaDF14a04A0bA4AB76fA57b3923dd100986E1B50f',
  //     UI_INCENTIVE_DATA_PROVIDER: '0x17A26446addc32C7c19F00aCe93Dd0c6026d62DF',
  //     COLLECTOR: '0x737c57442E90A5597a50620C864Ab916654f755E',
  //     V3_MIGRATOR: '',
  //   },
  // },
  //@Fifth Deployment
  [CustomMarket.bsc_testnet_v3]: {
    v3: true,
    marketTitle: 'BSC',
    chainId: parseInt(process.env.NEXT_PUBLIC_MANEKI_CHAINID as string) || 97,
    enabledFeatures: {},
    addresses: {
      MERKLE_DIST: process.env.NEXT_PUBLIC_MANEKI_MERKLE_DIST || '',
      LENDING_POOL_ADDRESS_PROVIDER:
        process.env.NEXT_PUBLIC_MANEKI_LENDING_POOL_ADDRESS_PROVIDER || '',
      LENDING_POOL: process.env.NEXT_PUBLIC_MANEKI_LENDING_POOL || '',
      WETH_GATEWAY: process.env.NEXT_PUBLIC_MANEKI_WETH_GATEWAY || '',
      SWAP_COLLATERAL_ADAPTER: '',
      REPAY_WITH_COLLATERAL_ADAPTER: '',
      FAUCET: '',
      PERMISSION_MANAGER: '',
      WALLET_BALANCE_PROVIDER: process.env.NEXT_PUBLIC_MANEKI_WALLET_BALANCE_PROVIDER || '',
      L2_ENCODER: '',
      UI_POOL_DATA_PROVIDER: process.env.NEXT_PUBLIC_MANEKI_UI_POOL_DATA_PROVIDER || '',
      UI_INCENTIVE_DATA_PROVIDER: process.env.NEXT_PUBLIC_MANEKI_UI_INCENTIVE_DATA_PROVIDER || '',
      COLLECTOR: process.env.NEXT_PUBLIC_MANEKI_COLLECTOR || '',
      V3_MIGRATOR: '',
      STAKING_DATA_PROVIDER: process.env.NEXT_PUBLIC_MANEKI_STAKING_DATA_PROVIDER || '',
      MASTER_CHEF: process.env.NEXT_PUBLIC_MANEKI_MASTER_CHEF || '',
      LP_TOKEN: process.env.NEXT_PUBLIC_MANEKI_LP_TOKEN || '',
      PAW_TOKEN: process.env.NEXT_PUBLIC_MANEKI_PAW_TOKEN || '',
      PAW_PRICE_ORACLE: process.env.NEXT_PUBLIC_MANEKI_PAW_PRICE_ORACLE || '',
      PRICE_ORACLE: process.env.NEXT_PUBLIC_MANEKI_PRICE_ORACLE || '',
      LENDING_PROTOCOL_DATA_PROVIDER:
        process.env.NEXT_PUBLIC_MANEKI_LENDING_PROTOCOL_DATA_PROVIDER || '',
      CHEF_INCENTIVES_CONTROLLER: process.env.NEXT_PUBLIC_MANEKI_CHEF_INCENTIVES_CONTROLLER || '',
      EARLY_TOKEN_GENERATION: process.env.NEXT_PUBLIC_MANEKI_EARLY_TOKEN_GENERATION || '',
    },
  },
  /*
  [CustomMarket.proto_mainnet_v3]: {
    marketTitle: 'Ethereum',
    chainId: ChainId.mainnet,
    v3: true,
    disableCharts: true,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: true,
      collateralRepay: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Ethereum.POOL,
      WETH_GATEWAY: markets.AaveV3Ethereum.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV3Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: markets.AaveV3Ethereum.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Ethereum.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Ethereum.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: markets.AaveV3Ethereum.COLLECTOR,
    },
    // halIntegration: {
    //   URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
    //   marketName: 'aavev3',
    // },
  },

  */
  // [CustomMarket.proto_mainnet]: {
  //   marketTitle: 'Ethereum',
  //   chainId: ChainId.mainnet,
  //   enabledFeatures: {
  //     governance: true,
  //     staking: true,
  //     liquiditySwap: true,
  //     collateralRepay: true,
  //     incentives: true,
  //   },
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV2Ethereum.POOL_ADDRESSES_PROVIDER,
  //     LENDING_POOL: markets.AaveV2Ethereum.POOL,
  //     WETH_GATEWAY: markets.AaveV2Ethereum.WETH_GATEWAY,
  //     REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV2Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
  //     SWAP_COLLATERAL_ADAPTER: markets.AaveV2Ethereum.SWAP_COLLATERAL_ADAPTER,
  //     WALLET_BALANCE_PROVIDER: markets.AaveV2Ethereum.WALLET_BALANCE_PROVIDER,
  //     UI_POOL_DATA_PROVIDER: markets.AaveV2Ethereum.UI_POOL_DATA_PROVIDER,
  //     UI_INCENTIVE_DATA_PROVIDER: markets.AaveV2Ethereum.UI_INCENTIVE_DATA_PROVIDER,
  //     COLLECTOR: markets.AaveV2Ethereum.COLLECTOR,
  //     V3_MIGRATOR: markets.AaveV2Ethereum.MIGRATION_HELPER,
  //   },
  //   halIntegration: {
  //     URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
  //     marketName: 'aavev2',
  //   },
  // },
  /*
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV2EthereumAMM.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV2EthereumAMM.POOL,
      WETH_GATEWAY: markets.AaveV2EthereumAMM.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: markets.AaveV2EthereumAMM.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV2EthereumAMM.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV2EthereumAMM.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: markets.AaveV2EthereumAMM.COLLECTOR,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV2Polygon.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV2Polygon.POOL,
      WETH_GATEWAY: markets.AaveV2Polygon.WETH_GATEWAY,
      SWAP_COLLATERAL_ADAPTER: markets.AaveV2Polygon.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV2Polygon.REPAY_WITH_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: markets.AaveV2Polygon.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV2Polygon.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV2Polygon.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: markets.AaveV2Polygon.COLLECTOR,
      V3_MIGRATOR: markets.AaveV2Polygon.MIGRATION_HELPER,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV2Avalanche.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV2Avalanche.POOL,
      WETH_GATEWAY: markets.AaveV2Avalanche.WETH_GATEWAY,
      SWAP_COLLATERAL_ADAPTER: markets.AaveV2Avalanche.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV2Avalanche.REPAY_WITH_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: markets.AaveV2Avalanche.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV2Avalanche.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV2Avalanche.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: markets.AaveV2Avalanche.COLLECTOR,
      V3_MIGRATOR: markets.AaveV2Avalanche.MIGRATION_HELPER,
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
      marketName: 'aaveavalanche',
    },
  },
  // v3
  [CustomMarket.proto_goerli_v3]: {
    marketTitle: 'Ethereum Görli',
    v3: true,
    chainId: ChainId.goerli,
    enabledFeatures: {
      faucet: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Goerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Goerli.POOL,
      WETH_GATEWAY: markets.AaveV3Goerli.WETH_GATEWAY,
      FAUCET: markets.AaveV3Goerli.FAUCET,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Goerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Goerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Goerli.UI_INCENTIVE_DATA_PROVIDER,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Arbitrum.POOL,
      WETH_GATEWAY: markets.AaveV3Arbitrum.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Arbitrum.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Arbitrum.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: markets.AaveV3Arbitrum.L2_ENCODER,
      COLLECTOR: markets.AaveV3Arbitrum.COLLECTOR,
      SWAP_COLLATERAL_ADAPTER: markets.AaveV3Arbitrum.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV3Arbitrum.REPAY_WITH_COLLATERAL_ADAPTER,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3ArbitrumGoerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3ArbitrumGoerli.POOL,
      WETH_GATEWAY: markets.AaveV3ArbitrumGoerli.WETH_GATEWAY,
      FAUCET: markets.AaveV3ArbitrumGoerli.FAUCET,
      WALLET_BALANCE_PROVIDER: markets.AaveV3ArbitrumGoerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3ArbitrumGoerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3ArbitrumGoerli.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: markets.AaveV3ArbitrumGoerli.L2_ENCODER,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Avalanche.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Avalanche.POOL,
      WETH_GATEWAY: markets.AaveV3Avalanche.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV3Avalanche.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: markets.AaveV3Avalanche.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Avalanche.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Avalanche.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Avalanche.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: markets.AaveV3Avalanche.COLLECTOR,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Fuji.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Fuji.POOL,
      WETH_GATEWAY: markets.AaveV3Fuji.WETH_GATEWAY,
      FAUCET: markets.AaveV3Fuji.FAUCET,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Fuji.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Fuji.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Fuji.UI_INCENTIVE_DATA_PROVIDER,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3OptimismGoerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3OptimismGoerli.POOL,
      WETH_GATEWAY: markets.AaveV3OptimismGoerli.WETH_GATEWAY,
      FAUCET: markets.AaveV3OptimismGoerli.FAUCET,
      WALLET_BALANCE_PROVIDER: markets.AaveV3OptimismGoerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3OptimismGoerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3OptimismGoerli.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: markets.AaveV3OptimismGoerli.L2_ENCODER,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Fantom.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Fantom.POOL,
      WETH_GATEWAY: markets.AaveV3Fantom.WETH_GATEWAY,
      SWAP_COLLATERAL_ADAPTER: markets.AaveV3Fantom.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV3Fantom.REPAY_WITH_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Fantom.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Fantom.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Fantom.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: markets.AaveV3Fantom.COLLECTOR,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3FantomTestnet.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3FantomTestnet.POOL,
      WETH_GATEWAY: markets.AaveV3FantomTestnet.WETH_GATEWAY,
      FAUCET: markets.AaveV3FantomTestnet.FAUCET,
      WALLET_BALANCE_PROVIDER: markets.AaveV3FantomTestnet.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3FantomTestnet.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3FantomTestnet.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
  [CustomMarket.proto_harmony_v3]: {
    marketTitle: 'Harmony',
    v3: true,
    chainId: ChainId.harmony,
    enabledFeatures: {
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Harmony.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Harmony.POOL,
      WETH_GATEWAY: markets.AaveV3Harmony.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Harmony.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Harmony.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Harmony.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: markets.AaveV3Harmony.COLLECTOR,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Optimism.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Optimism.POOL,
      WETH_GATEWAY: markets.AaveV3Optimism.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Optimism.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Optimism.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Optimism.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: markets.AaveV3Optimism.L2_ENCODER,
      COLLECTOR: markets.AaveV3Optimism.COLLECTOR,
      SWAP_COLLATERAL_ADAPTER: markets.AaveV3Optimism.SWAP_COLLATERAL_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV3Optimism.REPAY_WITH_COLLATERAL_ADAPTER,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Polygon.POOL,
      WETH_GATEWAY: markets.AaveV3Polygon.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: markets.AaveV3Polygon.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: markets.AaveV3Polygon.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Polygon.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Polygon.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Polygon.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: markets.AaveV3Polygon.COLLECTOR,
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV3Mumbai.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV3Mumbai.POOL,
      WETH_GATEWAY: markets.AaveV3Mumbai.WETH_GATEWAY,
      FAUCET: markets.AaveV3Mumbai.FAUCET,
      WALLET_BALANCE_PROVIDER: markets.AaveV3Mumbai.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV3Mumbai.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV3Mumbai.UI_INCENTIVE_DATA_PROVIDER,
    },
    v3: true,
  },
  [CustomMarket.proto_goerli]: {
    marketTitle: 'Ethereum Görli',
    chainId: ChainId.goerli,
    enabledFeatures: {
      faucet: true,
    },

    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV2Goerli.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV2Goerli.POOL,
      WETH_GATEWAY: markets.AaveV2Goerli.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: markets.AaveV2Goerli.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV2Goerli.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV2Goerli.UI_INCENTIVE_DATA_PROVIDER,
      FAUCET: markets.AaveV2Goerli.FAUCET,
    },
  },
  [CustomMarket.proto_mumbai]: {
    marketTitle: 'Polygon Mumbai',
    chainId: ChainId.mumbai,
    enabledFeatures: {
      incentives: true,
      faucet: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV2Mumbai.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV2Mumbai.POOL,
      WETH_GATEWAY: markets.AaveV2Mumbai.WETH_GATEWAY,
      FAUCET: markets.AaveV2Mumbai.FAUCET,
      WALLET_BALANCE_PROVIDER: markets.AaveV2Mumbai.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV2Mumbai.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV2Mumbai.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
  [CustomMarket.proto_fuji]: {
    marketTitle: 'Avalanche Fuji',
    chainId: ChainId.fuji,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: markets.AaveV2Fuji.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: markets.AaveV2Fuji.POOL,
      WETH_GATEWAY: markets.AaveV2Fuji.WETH_GATEWAY,
      FAUCET: markets.AaveV2Fuji.FAUCET,
      WALLET_BALANCE_PROVIDER: markets.AaveV2Fuji.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: markets.AaveV2Fuji.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: markets.AaveV2Fuji.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
  */
} as const;
