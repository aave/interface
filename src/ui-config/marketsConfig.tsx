import { ChainId } from '@aave/contract-helpers';
import { AaveV3Arbitrum } from '@bgd-labs/aave-address-book';
import { ReactNode } from 'react';

// Enable for premissioned market
// import { PermissionView } from 'src/components/transactions/FlowCommons/PermissionView';
export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  market: CustomMarket;
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
    withdrawAndSwitch?: boolean;
    switch?: boolean;
  };
  permitDisabled?: boolean; // intended to be used for testnets
  isFork?: boolean;
  permissionComponent?: ReactNode;
  disableCharts?: boolean;
  subgraphUrl?: string;
  logo?: string;
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    LENDING_POOL: string;
    WETH_GATEWAY?: string;
    SWAP_COLLATERAL_ADAPTER?: string;
    REPAY_WITH_COLLATERAL_ADAPTER?: string;
    DEBT_SWITCH_ADAPTER?: string;
    WITHDRAW_SWITCH_ADAPTER?: string;
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
};
export enum CustomMarket {
  // v3 test networks
  proto_arbitrum_sepolia_v3 = 'proto_arbitrum_sepolia_v3',
  // v3 mainnets
  proto_arbitrum_v3 = 'proto_arbitrum_v3',
}

const apiKey = process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY;

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_arbitrum_sepolia_v3]: {
    marketTitle: 'Arbitrum Sepolia',
    market: CustomMarket.proto_arbitrum_sepolia_v3,
    v3: true,
    permitDisabled: true,
    chainId: ChainId.arbitrum_sepolia,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xbdc2803d37359ec35e01c7995a0e219f19d2abfc',
      LENDING_POOL: '0xf371059c30a2e42b08039f0c22b49846954b76ab',
      WETH_GATEWAY: '0xb1223ac83e73e7b9c469083484aa1caab3354fbb',
      // FAUCET: AaveV3ArbitrumSepolia.FAUCET,
      WALLET_BALANCE_PROVIDER: '0x8f1017937e470e9e2e10bc8f439714cc44ef526a',
      UI_POOL_DATA_PROVIDER: '0x07b39a75340a81c4acbbf736f86e859206d22c21',
      UI_INCENTIVE_DATA_PROVIDER: '0x8afae2e4f74d8a1326d72e19b281136a1e8f9bf6',
      L2_ENCODER: '0x6d9fcd0de4218c8f3d5392d13c96828b326adb88',
      GHO_TOKEN_ADDRESS: '0xb13Cfa6f8B2Eed2C37fB00fF0c1A59807C585810',
    },
  },
  [CustomMarket.proto_arbitrum_v3]: {
    marketTitle: 'Arbitrum',
    market: CustomMarket.proto_arbitrum_v3,
    v3: true,
    chainId: ChainId.arbitrum_one,
    enabledFeatures: {
      incentives: true,
      liquiditySwap: true,
      collateralRepay: true,
      debtSwitch: true,
      withdrawAndSwitch: true,
      switch: true,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/DLuE98kEb5pQNXAcKFQGQgfSQ57Xdou4jnVbAEqMfy3B`,
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
      WITHDRAW_SWITCH_ADAPTER: AaveV3Arbitrum.WITHDRAW_SWAP_ADAPTER,
      GHO_TOKEN_ADDRESS: AaveV3Arbitrum.ASSETS.GHO.UNDERLYING,
    },
  },
} as const;
