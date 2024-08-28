import { ChainId } from '@aave/contract-helpers';
import {
  AaveV2Avalanche,
  AaveV2Ethereum,
  AaveV2EthereumAMM,
  AaveV2Fuji,
  AaveV2Polygon,
  AaveV3Arbitrum,
  AaveV3ArbitrumSepolia,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3BaseSepolia,
  AaveV3BNB,
  AaveV3Ethereum,
  AaveV3EthereumLido,
  AaveV3Fantom,
  AaveV3FantomTestnet,
  AaveV3Fuji,
  AaveV3Gnosis,
  AaveV3Harmony,
  AaveV3Metis,
  AaveV3Optimism,
  AaveV3OptimismSepolia,
  AaveV3Polygon,
  AaveV3Scroll,
  AaveV3ScrollSepolia,
  AaveV3Sepolia,
} from '@bgd-labs/aave-address-book';
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
  // v3 test networks, all v3.0.1
  proto_arbitrum_sepolia_v3 = 'proto_arbitrum_sepolia_v3',
  proto_fantom_testnet_v3 = 'proto_fantom_testnet_v3',
  proto_fuji_v3 = 'proto_fuji_v3',
  proto_optimism_sepolia_v3 = 'proto_optimism_sepolia_v3',
  proto_scroll_sepolia_v3 = 'proto_scroll_sepolia_v3',
  proto_sepolia_v3 = 'proto_sepolia_v3',
  proto_base_sepolia_v3 = 'proto_base_sepolia_v3',
  // v3 mainnets
  proto_mainnet_v3 = 'proto_mainnet_v3',
  proto_optimism_v3 = 'proto_optimism_v3',
  proto_fantom_v3 = 'proto_fantom_v3',
  proto_harmony_v3 = 'proto_harmony_v3',
  proto_avalanche_v3 = 'proto_avalanche_v3',
  proto_polygon_v3 = 'proto_polygon_v3',
  proto_arbitrum_v3 = 'proto_arbitrum_v3',
  proto_metis_v3 = 'proto_metis_v3',
  proto_base_v3 = 'proto_base_v3',
  proto_gnosis_v3 = 'proto_gnosis_v3',
  proto_bnb_v3 = 'proto_bnb_v3',
  proto_scroll_v3 = 'proto_scroll_v3',
  proto_lido_v3 = 'proto_lido_v3',
  // v2
  proto_mainnet = 'proto_mainnet',
  proto_avalanche = 'proto_avalanche',
  proto_fuji = 'proto_fuji',
  proto_polygon = 'proto_polygon',
  amm_mainnet = 'amm_mainnet',
  // external
  // permissioned_market = 'permissioned_market',
}

const apiKey = process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY;

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_mainnet_v3]: {
    marketTitle: 'Ethereum',
    market: CustomMarket.proto_mainnet_v3,
    chainId: ChainId.mainnet,
    v3: true,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: false,
      collateralRepay: false,
      incentives: true,
      withdrawAndSwitch: false,
      debtSwitch: false,
      switch: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g`,
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
      GHO_TOKEN_ADDRESS: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
      GHO_UI_DATA_PROVIDER: AaveV3Ethereum.UI_GHO_DATA_PROVIDER,
      WITHDRAW_SWITCH_ADAPTER: AaveV3Ethereum.WITHDRAW_SWAP_ADAPTER,
      DEBT_SWITCH_ADAPTER: AaveV3Ethereum.DEBT_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_lido_v3]: {
    marketTitle: 'Ethereum Lido Market',
    market: CustomMarket.proto_lido_v3,
    chainId: ChainId.mainnet,
    v3: true,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: false,
      collateralRepay: false,
      incentives: true,
      withdrawAndSwitch: false,
      debtSwitch: false,
      switch: false,
    },
    // subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g`,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3EthereumLido.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3EthereumLido.POOL,
      WETH_GATEWAY: AaveV3EthereumLido.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3EthereumLido.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV3EthereumLido.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV3EthereumLido.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3EthereumLido.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3EthereumLido.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Ethereum.COLLECTOR,
      WITHDRAW_SWITCH_ADAPTER: AaveV3EthereumLido.WITHDRAW_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_mainnet]: {
    marketTitle: 'Ethereum',
    market: CustomMarket.proto_mainnet,
    chainId: ChainId.mainnet,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: false,
      collateralRepay: false,
      incentives: true,
      debtSwitch: false,
      switch: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N`,
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
  },
  // [CustomMarket.permissioned_market]: {
  //   marketTitle: 'Ethereum Permissioned Market example',
  //   chainId: ChainId.mainnet,
  //   enabledFeatures: {
  //     // liquiditySwap: false,
  //     // collateralRepay: false,
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
    market: CustomMarket.amm_mainnet,
    chainId: ChainId.mainnet,
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
    market: CustomMarket.proto_polygon,
    chainId: ChainId.polygon,
    enabledFeatures: {
      liquiditySwap: false,
      incentives: true,
      collateralRepay: false,
      debtSwitch: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/H1Et77RZh3XEf27vkAmJyzgCME2RSFLtDS2f4PPW6CGp`,
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
  },
  [CustomMarket.proto_avalanche]: {
    marketTitle: 'Avalanche',
    market: CustomMarket.proto_avalanche,
    chainId: ChainId.avalanche,
    enabledFeatures: {
      liquiditySwap: false,
      incentives: true,
      collateralRepay: false,
      debtSwitch: false,
      switch: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/EZvK18pMhwiCjxwesRLTg81fP33WnR6BnZe5Cvma3H1C`,
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
  },
  // v3
  [CustomMarket.proto_sepolia_v3]: {
    marketTitle: 'Ethereum Sepolia',
    market: CustomMarket.proto_sepolia_v3,
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
      GHO_TOKEN_ADDRESS: '0xc4bF5CbDaBE595361438F8c6a187bDc330539c60',
      GHO_UI_DATA_PROVIDER: '0x69B9843A16a6E9933125EBD97659BA3CCbE2Ef8A',
    },
  },
  [CustomMarket.proto_base_v3]: {
    marketTitle: 'Base',
    market: CustomMarket.proto_base_v3,
    v3: true,
    chainId: ChainId.base,
    enabledFeatures: {
      incentives: true,
      liquiditySwap: false,
      withdrawAndSwitch: false,
      collateralRepay: false,
      debtSwitch: false,
      switch: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF`,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Base.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Base.POOL,
      WETH_GATEWAY: AaveV3Base.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: AaveV3Base.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Base.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Base.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3Base.L2_ENCODER,
      COLLECTOR: AaveV3Base.COLLECTOR,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3Base.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV3Base.SWAP_COLLATERAL_ADAPTER,
      // WALLET_BALANCE_PROVIDER: AaveV2Ethereum.WALLET_BALANCE_PROVIDER,
      WITHDRAW_SWITCH_ADAPTER: AaveV3Base.WITHDRAW_SWAP_ADAPTER,
      DEBT_SWITCH_ADAPTER: AaveV3Base.DEBT_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_arbitrum_sepolia_v3]: {
    marketTitle: 'Arbitrum Sepolia',
    market: CustomMarket.proto_arbitrum_sepolia_v3,
    v3: true,
    permitDisabled: true,
    chainId: ChainId.arbitrum_sepolia,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3ArbitrumSepolia.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3ArbitrumSepolia.POOL,
      WETH_GATEWAY: AaveV3ArbitrumSepolia.WETH_GATEWAY,
      // FAUCET: AaveV3ArbitrumSepolia.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3ArbitrumSepolia.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3ArbitrumSepolia.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3ArbitrumSepolia.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3ArbitrumSepolia.L2_ENCODER,
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
      liquiditySwap: false,
      collateralRepay: false,
      debtSwitch: false,
      withdrawAndSwitch: false,
      switch: false,
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
      GHO_TOKEN_ADDRESS: '0x7dff72693f6a4149b17e7c6314655f6a9f7c8b33',
    },
  },
  [CustomMarket.proto_base_sepolia_v3]: {
    marketTitle: 'Base Sepolia',
    market: CustomMarket.proto_base_sepolia_v3,
    v3: true,
    permitDisabled: true,
    chainId: ChainId.base_sepolia,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3BaseSepolia.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3BaseSepolia.POOL,
      WETH_GATEWAY: AaveV3BaseSepolia.WETH_GATEWAY,
      // FAUCET: AaveV3ArbitrumSepolia.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3BaseSepolia.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3BaseSepolia.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3BaseSepolia.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3BaseSepolia.L2_ENCODER,
    },
  },
  [CustomMarket.proto_avalanche_v3]: {
    marketTitle: 'Avalanche',
    market: CustomMarket.proto_avalanche_v3,
    v3: true,
    chainId: ChainId.avalanche,
    enabledFeatures: {
      liquiditySwap: false,
      incentives: true,
      collateralRepay: false,
      debtSwitch: false,
      withdrawAndSwitch: false,
      switch: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/2h9woxy8RTjHu1HJsCEnmzpPHFArU33avmUh4f71JpVn`,
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
      WITHDRAW_SWITCH_ADAPTER: AaveV3Avalanche.WITHDRAW_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_fuji_v3]: {
    marketTitle: 'Avalanche Fuji',
    market: CustomMarket.proto_fuji_v3,
    v3: true,
    chainId: ChainId.fuji,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
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
  [CustomMarket.proto_optimism_sepolia_v3]: {
    marketTitle: 'Optimism Sepolia',
    market: CustomMarket.proto_optimism_sepolia_v3,
    v3: true,
    permitDisabled: true,
    chainId: ChainId.optimism_sepolia,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3OptimismSepolia.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3OptimismSepolia.POOL,
      WETH_GATEWAY: AaveV3OptimismSepolia.WETH_GATEWAY,
      // FAUCET: AaveV3OptimismSepolia.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3OptimismSepolia.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3OptimismSepolia.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3OptimismSepolia.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3OptimismSepolia.L2_ENCODER,
    },
  },
  [CustomMarket.proto_scroll_sepolia_v3]: {
    marketTitle: 'Scroll Sepolia',
    market: CustomMarket.proto_scroll_sepolia_v3,
    v3: true,
    chainId: ChainId.scroll_sepolia,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3ScrollSepolia.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3ScrollSepolia.POOL,
      WETH_GATEWAY: AaveV3ScrollSepolia.WETH_GATEWAY,
      FAUCET: AaveV3ScrollSepolia.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3ScrollSepolia.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3ScrollSepolia.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3ScrollSepolia.UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: AaveV3ScrollSepolia.L2_ENCODER,
    },
  },
  [CustomMarket.proto_fantom_v3]: {
    marketTitle: 'Fantom',
    market: CustomMarket.proto_fantom_v3,
    v3: true,
    chainId: ChainId.fantom,
    enabledFeatures: {
      incentives: true,
      collateralRepay: false,
      liquiditySwap: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/6L1vPqyE3xvkzkWjh6wUKc1ABWYYps5HJahoxhrv2PJn`,
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
  },
  [CustomMarket.proto_fantom_testnet_v3]: {
    marketTitle: 'Fantom Testnet',
    market: CustomMarket.proto_fantom_testnet_v3,
    v3: true,
    chainId: ChainId.fantom_testnet,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
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
    market: CustomMarket.proto_harmony_v3,
    v3: true,
    chainId: ChainId.harmony,
    enabledFeatures: {
      incentives: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/FifJapBdCqT9vgNqJ5axmr6eNyUpUSaRAbbZTfsViNsT`,
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
    market: CustomMarket.proto_optimism_v3,
    v3: true,
    chainId: ChainId.optimism,
    enabledFeatures: {
      incentives: true,
      collateralRepay: false,
      liquiditySwap: false,
      debtSwitch: false,
      withdrawAndSwitch: false,
      switch: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/DSfLz8oQBUeU5atALgUFQKMTSYV9mZAVYp4noLSXAfvb`,
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
      WITHDRAW_SWITCH_ADAPTER: AaveV3Optimism.WITHDRAW_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_polygon_v3]: {
    marketTitle: 'Polygon',
    market: CustomMarket.proto_polygon_v3,
    chainId: ChainId.polygon,
    v3: true,
    enabledFeatures: {
      liquiditySwap: false,
      incentives: true,
      collateralRepay: false,
      debtSwitch: false,
      withdrawAndSwitch: false,
      switch: false,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/Co2URyXjnxaw8WqxKyVHdirq9Ahhm5vcTs4dMedAq211`,
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
      WITHDRAW_SWITCH_ADAPTER: AaveV3Polygon.WITHDRAW_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_fuji]: {
    marketTitle: 'Avalanche Fuji',
    market: CustomMarket.proto_fuji,
    chainId: ChainId.fuji,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
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
    market: CustomMarket.proto_metis_v3,
    chainId: ChainId.metis_andromeda,
    v3: true,
    enabledFeatures: {
      incentives: true,
    },
    subgraphUrl: 'https://metisapi.0xgraph.xyz/subgraphs/name/aave/protocol-v3-metis',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Metis.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Metis.POOL,
      WETH_GATEWAY: '0x0', // not applicable for Metis
      WALLET_BALANCE_PROVIDER: AaveV3Metis.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Metis.UI_POOL_DATA_PROVIDER,

      UI_INCENTIVE_DATA_PROVIDER: AaveV3Metis.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Metis.COLLECTOR,
    },
  },
  [CustomMarket.proto_gnosis_v3]: {
    marketTitle: 'Gnosis',
    market: CustomMarket.proto_gnosis_v3,
    chainId: ChainId.xdai,
    v3: true,
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/HtcDaL8L8iZ2KQNNS44EBVmLruzxuNAz1RkBYdui1QUT`,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Gnosis.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Gnosis.POOL,
      WETH_GATEWAY: AaveV3Gnosis.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: AaveV3Gnosis.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Gnosis.UI_POOL_DATA_PROVIDER,

      UI_INCENTIVE_DATA_PROVIDER: AaveV3Gnosis.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Gnosis.COLLECTOR,
    },
  },
  [CustomMarket.proto_bnb_v3]: {
    marketTitle: 'BNB Chain',
    market: CustomMarket.proto_bnb_v3,
    chainId: ChainId.bnb,
    v3: true,
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/7Jk85XgkV1MQ7u56hD8rr65rfASbayJXopugWkUoBMnZ`,
    enabledFeatures: {
      liquiditySwap: false,
      collateralRepay: false,
      debtSwitch: false,
      withdrawAndSwitch: false,
      switch: false,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3BNB.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3BNB.POOL,
      WETH_GATEWAY: AaveV3BNB.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV3BNB.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV3BNB.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV3BNB.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3BNB.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3BNB.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3BNB.COLLECTOR,
      DEBT_SWITCH_ADAPTER: AaveV3BNB.DEBT_SWAP_ADAPTER,
      WITHDRAW_SWITCH_ADAPTER: AaveV3BNB.WITHDRAW_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_scroll_v3]: {
    marketTitle: 'Scroll',
    market: CustomMarket.proto_scroll_v3,
    chainId: ChainId.scroll,
    v3: true,
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/74JwenoHZb2aAYVGCCSdPWzi9mm745dyHyQQVoZ7Sbub`,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Scroll.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Scroll.POOL,
      WETH_GATEWAY: AaveV3Scroll.WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: AaveV3Scroll.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Scroll.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Scroll.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Scroll.COLLECTOR,
    },
  },
} as const;
