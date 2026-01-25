import { ChainId } from '@aave/contract-helpers';
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
  // v3 mainnets - custom markets
  proto_monad_v3 = 'proto_monad_v3',
}

const MONAD_CHAIN_ID = 105;

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
      LENDING_POOL_ADDRESS_PROVIDER:
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_LENDING_POOL_ADDRESS_PROVIDER ||
        '0xbdc2803d37359ec35e01c7995a0e219f19d2abfc',
      LENDING_POOL:
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_LENDING_POOL ||
        '0xf371059c30a2e42b08039f0c22b49846954b76ab',
      WETH_GATEWAY:
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_WETH_GATEWAY ||
        '0xb1223ac83e73e7b9c469083484aa1caab3354fbb',
      WALLET_BALANCE_PROVIDER:
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_WALLET_BALANCE_PROVIDER ||
        '0x8f1017937e470e9e2e10bc8f439714cc44ef526a',
      UI_POOL_DATA_PROVIDER:
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_UI_POOL_DATA_PROVIDER ||
        '0x07b39a75340a81c4acbbf736f86e859206d22c21',
      UI_INCENTIVE_DATA_PROVIDER:
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_UI_INCENTIVE_DATA_PROVIDER ||
        '0x8afae2e4f74d8a1326d72e19b281136a1e8f9bf6',
      L2_ENCODER:
        process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_L2_ENCODER ||
        '0x6d9fcd0de4218c8f3d5392d13c96828b326adb88',
    },
  },
  [CustomMarket.proto_monad_v3]: {
    marketTitle: 'Monad',
    market: CustomMarket.proto_monad_v3,
    v3: true,
    chainId: MONAD_CHAIN_ID as ChainId,
    enabledFeatures: {
      incentives: true,
      liquiditySwap: true,
      collateralRepay: true,
      debtSwitch: true,
      withdrawAndSwitch: true,
      switch: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER:
        process.env.NEXT_PUBLIC_MONAD_LENDING_POOL_ADDRESS_PROVIDER || '',
      LENDING_POOL: process.env.NEXT_PUBLIC_MONAD_LENDING_POOL || '',
      WETH_GATEWAY: process.env.NEXT_PUBLIC_MONAD_WETH_GATEWAY || '',
      WALLET_BALANCE_PROVIDER: process.env.NEXT_PUBLIC_MONAD_WALLET_BALANCE_PROVIDER || '',
      UI_POOL_DATA_PROVIDER: process.env.NEXT_PUBLIC_MONAD_UI_POOL_DATA_PROVIDER || '',
      UI_INCENTIVE_DATA_PROVIDER: process.env.NEXT_PUBLIC_MONAD_UI_INCENTIVE_DATA_PROVIDER || '',
      L2_ENCODER: process.env.NEXT_PUBLIC_MONAD_L2_ENCODER || '',
      SWAP_COLLATERAL_ADAPTER: process.env.NEXT_PUBLIC_MONAD_SWAP_COLLATERAL_ADAPTER || '',
      REPAY_WITH_COLLATERAL_ADAPTER:
        process.env.NEXT_PUBLIC_MONAD_REPAY_WITH_COLLATERAL_ADAPTER || '',
      DEBT_SWITCH_ADAPTER: process.env.NEXT_PUBLIC_MONAD_DEBT_SWITCH_ADAPTER || '',
      WITHDRAW_SWITCH_ADAPTER: process.env.NEXT_PUBLIC_MONAD_WITHDRAW_SWITCH_ADAPTER || '',
      COLLECTOR: process.env.NEXT_PUBLIC_MONAD_COLLECTOR || '',
    },
  },
} as const;
