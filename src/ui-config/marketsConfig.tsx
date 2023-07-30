// import { ChainId } from '@aave/contract-helpers';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { ReactNode } from 'react';

// Enable for premissioned market
// import { PermissionView } from 'src/components/transactions/FlowCommons/PermissionView';

export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  // the network the market operates on
  chainId: number;
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
  // proto_arbitrum_goerli_v3 = 'proto_arbitrum_goerli_v3',
  // proto_mumbai_v3 = 'proto_mumbai_v3',
  // proto_fantom_testnet_v3 = 'proto_fantom_testnet_v3',
  // proto_fuji_v3 = 'proto_fuji_v3',
  // proto_goerli_v3 = 'proto_goerli_v3',
  // proto_optimism_goerli_v3 = 'proto_optimism_goerli_v3',
  // proto_scroll_alpha_v3 = 'proto_scroll_alpha_v3',
  // proto_sepolia_v3 = 'proto_sepolia_v3',
  // // v3 mainnets
  proto_linea_v3 = 'proto_linea_v3',
  // proto_optimism_v3 = 'proto_optimism_v3',
  // proto_fantom_v3 = 'proto_fantom_v3',
  // proto_harmony_v3 = 'proto_harmony_v3',
  // proto_avalanche_v3 = 'proto_avalanche_v3',
  // proto_polygon_v3 = 'proto_polygon_v3',
  // proto_arbitrum_v3 = 'proto_arbitrum_v3',
  // proto_metis_v3 = 'proto_metis_v3',
  // // v2
  // proto_mainnet = 'proto_mainnet',
  // proto_avalanche = 'proto_avalanche',
  // proto_fuji = 'proto_fuji',
  // proto_polygon = 'proto_polygon',
  // proto_mumbai = 'proto_mumbai',
  // amm_mainnet = 'amm_mainnet',
  // proto_goerli = 'proto_goerli',
  // external
  // permissioned_market = 'permissioned_market',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_linea_v3]: {
    marketTitle: 'Linea',
    chainId: 59144,
    v3: true,
    enabledFeatures: {
      governance: false,
      staking: false,
      liquiditySwap: false,
      collateralRepay: false,
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
} as const;
