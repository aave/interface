import { ChainId } from '@aave/contract-helpers';
import { ReactNode } from 'react';
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
  // v3 mainnets
  proto_mainnet_v3 = 'proto_mainnet_v3',
  proto_optimism_v3 = 'proto_optimism_v3',
  proto_fantom_v3 = 'proto_fantom_v3',
  proto_harmony_v3 = 'proto_harmony_v3',
  proto_avalanche_v3 = 'proto_avalanche_v3',
  proto_polygon_v3 = 'proto_polygon_v3',
  proto_arbitrum_v3 = 'proto_arbitrum_v3',
  // proto_ethereum_v3_1 = 'proto_ethereum_v3_1',
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
    disableCharts: true,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: true,
      collateralRepay: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'.toLowerCase(),
      LENDING_POOL: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      WETH_GATEWAY: '0xD322A49006FC828F9B5B37Ab215F99B4E5caB19C',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x1809f186D680f239420B56948C58F8DbbCdf1E18',
      SWAP_COLLATERAL_ADAPTER: '0x872fBcb1B582e8Cd0D0DD4327fBFa0B4C2730995',
      WALLET_BALANCE_PROVIDER: '0xC7be5307ba715ce89b152f3Df0658295b3dbA8E2',
      UI_POOL_DATA_PROVIDER: '0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d',
      UI_INCENTIVE_DATA_PROVIDER: '0x162A7AC02f547ad796CA549f757e2b8d1D9b10a6',
      COLLECTOR: '0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c',
    },
    // halIntegration: {
    //   URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
    //   marketName: 'aavev3',
    // },
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'.toLowerCase(),
      LENDING_POOL: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      WETH_GATEWAY: '0xEFFC18fC3b7eb8E676dac549E0c693ad50D1Ce31',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x80Aca0C645fEdABaa20fd2Bf0Daf57885A309FE6',
      SWAP_COLLATERAL_ADAPTER: '0x135896DE8421be2ec868E0b811006171D9df802A',
      WALLET_BALANCE_PROVIDER: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
      UI_POOL_DATA_PROVIDER: '0x00e50FAB64eBB37b87df06Aa46b8B35d5f1A4e1A',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
      COLLECTOR: '0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c',
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
      marketName: 'aavev2',
    },
  },
  // [CustomMarket.proto_ethereum_v3_1]: {
  //   marketTitle: 'Ethereum',
  //   chainId: ChainId.mainnet,
  //   v3: true,
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'.toLowerCase(),
  //     LENDING_POOL: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  //     WETH_GATEWAY: '0xD322A49006FC828F9B5B37Ab215F99B4E5caB19C',
  //     WALLET_BALANCE_PROVIDER: '0xC7be5307ba715ce89b152f3Df0658295b3dbA8E2',
  //     UI_POOL_DATA_PROVIDER: '0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d',
  //     UI_INCENTIVE_DATA_PROVIDER: '0x162A7AC02f547ad796CA549f757e2b8d1D9b10a6',
  //     REPAY_WITH_COLLATERAL_ADAPTER: '0x1809f186D680f239420B56948C58F8DbbCdf1E18',
  //     SWAP_COLLATERAL_ADAPTER: '0x872fBcb1B582e8Cd0D0DD4327fBFa0B4C2730995',
  //   },
  // },
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
  //     LENDING_POOL_ADDRESS_PROVIDER: '<address here>'.toLowerCase(),
  //     LENDING_POOL: '<address here>',
  //     WETH_GATEWAY: '<address here>',
  //     // REPAY_WITH_COLLATERAL_ADAPTER: '<address here>',
  //     // SWAP_COLLATERAL_ADAPTER: '<address here>',
  //     WALLET_BALANCE_PROVIDER: '<address here>',
  //     UI_POOL_DATA_PROVIDER: '<address here>',
  //     // UI_INCENTIVE_DATA_PROVIDER: '<address here>',
  //     PERMISSION_MANAGER: '<address here>',
  //   },
  // },
  [CustomMarket.amm_mainnet]: {
    marketTitle: 'Ethereum AMM',
    chainId: ChainId.mainnet,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xacc030ef66f9dfeae9cbb0cd1b25654b82cfa8d5'.toLowerCase(),
      LENDING_POOL: '0x7937d4799803fbbe595ed57278bc4ca21f3bffcb',
      WETH_GATEWAY: '0x1C4a4e31231F71Fc34867D034a9E68f6fC798249',
      WALLET_BALANCE_PROVIDER: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
      UI_POOL_DATA_PROVIDER: '0x00e50FAB64eBB37b87df06Aa46b8B35d5f1A4e1A',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
      COLLECTOR: '0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xd05e3E715d945B59290df0ae8eF85c1BdB684744'.toLowerCase(),
      LENDING_POOL: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
      WETH_GATEWAY: '0xAeBF56223F044a73A513FAD7E148A9075227eD9b',
      SWAP_COLLATERAL_ADAPTER: '0x35784a624D4FfBC3594f4d16fA3801FeF063241c',
      REPAY_WITH_COLLATERAL_ADAPTER: '0xE84cF064a0a65290Ae5673b500699f3753063936',
      WALLET_BALANCE_PROVIDER: '0x34aa032bC416Cf2CdC45c0C8f065b1F19463D43e',
      UI_POOL_DATA_PROVIDER: '0x204f2Eb81D996729829debC819f7992DCEEfE7b1',
      UI_INCENTIVE_DATA_PROVIDER: '0x645654D59A5226CBab969b1f5431aA47CBf64ab8',
      COLLECTOR: '0x7734280A4337F37Fbf4651073Db7c28C80B339e9',
      V3_MIGRATOR: '0x3db487975aB1728DB5787b798866c2021B24ec52',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xb6A86025F0FE1862B372cb0ca18CE3EDe02A318f'.toLowerCase(),
      LENDING_POOL: '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C',
      WETH_GATEWAY: '0xC27d4dBefc2C0CE57916a699971b58a3BD9C7d5b',
      SWAP_COLLATERAL_ADAPTER: '0x2EcF2a2e74B19Aab2a62312167aFF4B78E93B6C5',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x935b362EE3E1f342cc48118C528AAbee5118F6e6',
      WALLET_BALANCE_PROVIDER: '0x73e4898a1Bfa9f710B6A6AB516403A6299e01fc6',
      UI_POOL_DATA_PROVIDER: '0x00e50FAB64eBB37b87df06Aa46b8B35d5f1A4e1A',
      UI_INCENTIVE_DATA_PROVIDER: '0x11979886A6dBAE27D7a72c49fCF3F23240D647bF',
      COLLECTOR: '0x467b92aF281d14cB6809913AD016a607b5ba8A36',
      V3_MIGRATOR: '0xf50a080aC535e531EC33cC05b227E910De2fb1fA',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xC911B590248d127aD18546B186cC6B324e99F02c'.toLowerCase(),
      LENDING_POOL: '0x7b5C526B7F8dfdff278b4a3e045083FBA4028790',
      WETH_GATEWAY: '0x2A498323aCaD2971a8b1936fD7540596dC9BBacD',
      FAUCET: '0xA70D8aD6d26931d0188c642A66de3B6202cDc5FA',
      WALLET_BALANCE_PROVIDER: '0xe0bb4593f74B804B9aBd9a2Ec6C71663cEE64E29',
      UI_POOL_DATA_PROVIDER: '0xb00A75686293Fea5DA122E8361f6815A0B0AF48E',
      UI_INCENTIVE_DATA_PROVIDER: '0xf4Ce3624c8D047aF8b069D044f00bF6774B4dEc0',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'.toLowerCase(),
      LENDING_POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      WETH_GATEWAY: '0xB5Ee21786D28c5Ba61661550879475976B707099',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0x145dE30c929a065582da84Cf96F88460dB9745A7',
      UI_INCENTIVE_DATA_PROVIDER: '0xDA67AF3403555Ce0AE3ffC22fDb7354458277358',
      L2_ENCODER: '0x9abADECD08572e0eA5aF4d47A9C7984a5AA503dC',
      COLLECTOR: '0x053D55f9B5AF8694c503EB288a1B7E552f590710',
      SWAP_COLLATERAL_ADAPTER: '0xAE9f94BD98eC2831a1330e0418bE0fDb5C95C2B9',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x32FdC26aFFA1eB331263Bcdd59F2e46eCbCC2E24',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x4EEE0BB72C2717310318f27628B3c8a708E4951C'.toLowerCase(),
      LENDING_POOL: '0xeAA2F46aeFd7BDe8fB91Df1B277193079b727655',
      WETH_GATEWAY: '0xBCca2fc5F30A65cE2155d739364f3fc8F57E6999',
      FAUCET: '0x0E0effeEFD42C108288b0EcDDc901222a4149e08',
      WALLET_BALANCE_PROVIDER: '0x39fDBFDBF1127F31F485a1228D44010F5130cCAC',
      UI_POOL_DATA_PROVIDER: '0x583F04c0C4BDE3D7706e939F3Ea890Be9A20A5CF',
      UI_INCENTIVE_DATA_PROVIDER: '0xB9107870a2e22b9cd4B51ED5483212Cb9eAE0329',
      L2_ENCODER: '0xE8BA4db946a310A1Aca92571A53D3bdE834B5409',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'.toLowerCase(),
      LENDING_POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      WETH_GATEWAY: '0x6F143FE2F7B02424ad3CaD1593D6f36c0Aab69d7',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x8a743090e9759E758d15a4CFd18408fb6332c625',
      SWAP_COLLATERAL_ADAPTER: '0xF7fC20D9D1D8DFE55F5F2c3180272a5747dD327F',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0xF71DBe0FAEF1473ffC607d4c555dfF0aEaDb878d',
      UI_INCENTIVE_DATA_PROVIDER: '0x265d414f80b0fca9505710e6F16dB4b67555D365',
      COLLECTOR: '0x5ba7fd868c40c16f7aDfAe6CF87121E13FC2F7a0',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x220c6A7D868FC38ECB47d5E69b99e9906300286A'.toLowerCase(),
      LENDING_POOL: '0xf319Bb55994dD1211bC34A7A26A336C6DD0B1b00',
      WETH_GATEWAY: '0x8f57153F18b7273f9A814b93b31Cb3f9b035e7C2',
      FAUCET: '0x66B3b92Fb1b2635504Cd5f878E26ABD8826aAf1E',
      WALLET_BALANCE_PROVIDER: '0xd2495B9f9F78092858e09e294Ed5c17Dbc5fCfA8',
      UI_POOL_DATA_PROVIDER: '0x08D07a855306400c8e499664f7f5247046274C77',
      UI_INCENTIVE_DATA_PROVIDER: '0xD764968BdAAdD2120F0E48a16fB29a6c73c13340',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x0b8FAe5f9Bf5a1a5867FB5b39fF4C028b1C2ebA9'.toLowerCase(),
      LENDING_POOL: '0xCAd01dAdb7E97ae45b89791D986470F3dfC256f7',
      WETH_GATEWAY: '0x6f7f2440006221F893c587b88f01afc42B6F8d2e',
      FAUCET: '0x777A5810352302A2D6d79d5B7323237c467845d9',
      WALLET_BALANCE_PROVIDER: '0xb463057Eb60E1575e2a69aa17C63CCd2F3161a5f',
      UI_POOL_DATA_PROVIDER: '0x9277eFbB991536a98a1aA8b735E9D26d887104C1',
      UI_INCENTIVE_DATA_PROVIDER: '0x4157398c5abB5211F51F5B551E3e240c5568dbD4',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'.toLowerCase(),
      LENDING_POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      WETH_GATEWAY: '0x1DcDA4de2Bf6c7AD9a34788D22aE6b7d55016e1f',
      SWAP_COLLATERAL_ADAPTER: '0xe387c6053ce8ec9f8c3fa5ce085af73114a695d3',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x1408401B2A7E28cB747b3e258D0831Fc926bAC51',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0xddf65434502E459C22263BE2ed7cF0f1FaFD44c0',
      UI_INCENTIVE_DATA_PROVIDER: '0x67Da261c14fd94cE7fDd77a0A8476E5b244089A9',
      COLLECTOR: '0xBe85413851D195fC6341619cD68BfDc26a25b928',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xC809bea009Ca8DAA680f6A1c4Ca020D550210736'.toLowerCase(),
      LENDING_POOL: '0x95b1B6470eAF8cC4A03d2D44C6b54eBB8ede8C30',
      WETH_GATEWAY: '0x87770f04Bbece8092d777860907798138825f303',
      FAUCET: '0x77523cB4402d241e324Bcf1EcEa91C4f63033B1b',
      WALLET_BALANCE_PROVIDER: '0x4E2e1F992A2ba1137fB6e1FcfbEdcaC95cA788e5',
      UI_POOL_DATA_PROVIDER: '0x9a00043F98941DD4e02E1c7e78676df64F5e37a6',
      UI_INCENTIVE_DATA_PROVIDER: '0xFBBdDFfFFcFBD55a6DF325d2be47077875Ef9eB9',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'.toLowerCase(),
      LENDING_POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      WETH_GATEWAY: '0xE387c6053CE8EC9f8C3fa5cE085Af73114a695d3',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0x1DcDA4de2Bf6c7AD9a34788D22aE6b7d55016e1f',
      UI_INCENTIVE_DATA_PROVIDER: '0xf7a60467aBb8A3240A0382b22E1B03c7d4F59Da5',
      COLLECTOR: '0x8A020d92D6B119978582BE4d3EdFdC9F7b28BF31',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'.toLowerCase(),
      LENDING_POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      WETH_GATEWAY: '0x76D3030728e52DEB8848d5613aBaDE88441cbc59',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0xbd83DdBE37fc91923d59C8c1E0bDe0CccCa332d5',
      UI_INCENTIVE_DATA_PROVIDER: '0x6F143FE2F7B02424ad3CaD1593D6f36c0Aab69d7',
      L2_ENCODER: '0x9abADECD08572e0eA5aF4d47A9C7984a5AA503dC',
      COLLECTOR: '0xB2289E329D2F85F1eD31Adbb30eA345278F21bcf',
      SWAP_COLLATERAL_ADAPTER: '0xC7524B08101dBe695d7ad671a332760b5d967Cbd',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x70371a494f73A8Df658C5cd29E2C1601787e1009',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'.toLowerCase(),
      LENDING_POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      WETH_GATEWAY: '0x1e4b7A6b903680eab0c5dAbcb8fD429cD2a9598c',
      REPAY_WITH_COLLATERAL_ADAPTER: '0xA125561fca253f19eA93970534Bb0364ea74187a',
      SWAP_COLLATERAL_ADAPTER: '0x301F221bc732907E2da2dbBFaA8F8F6847c170c3',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0xC69728f11E9E6127733751c8410432913123acf1',
      UI_INCENTIVE_DATA_PROVIDER: '0x874313A46e4957D29FAAC43BF5Eb2B144894f557',
      COLLECTOR: '0xe8599F3cc5D38a9aD6F3684cd5CEa72f10Dbc383',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xeb7A892BB04A8f836bDEeBbf60897A7Af1Bf5d7F'.toLowerCase(),
      LENDING_POOL: '0x0b913A76beFF3887d35073b8e5530755D60F78C7',
      WETH_GATEWAY: '0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17',
      FAUCET: '0xB00b414F9E45ba73B44fFC3E3Ce64a806552cD02',
      WALLET_BALANCE_PROVIDER: '0xdbaeF5FC90a979426E2cE5C3F0125430d0e2023e',
      UI_POOL_DATA_PROVIDER: '0x928d9A76705aA6e4a6650BFb7E7912e413Fe7341',
      UI_INCENTIVE_DATA_PROVIDER: '0xf7Dd602B3Cf90B2A20FC0F84E0419BeE104BdF16',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x5E52dEc931FFb32f609681B8438A51c675cc232d'.toLowerCase(),
      LENDING_POOL: '0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210',
      WETH_GATEWAY: '0x3bd3a20Ac9Ff1dda1D99C0dFCE6D65C4960B3627',
      WALLET_BALANCE_PROVIDER: '0xf1E4A6E7FA07421FD5139Ba0848290A27e22db7f',
      UI_POOL_DATA_PROVIDER: '0xaaa2872d1F7f5ceb630Cb736BcA34Ff1e121992b',
      UI_INCENTIVE_DATA_PROVIDER: '0xA2E05bE2090b3658A264bdf1C39387f5Dba367Ec',
      FAUCET: '0x681860075529352da2C94082Eb66c59dF958e89C',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x178113104fEcbcD7fF8669a0150721e231F0FD4B'.toLowerCase(),
      LENDING_POOL: '0x9198F13B08E299d85E096929fA9781A1E3d5d827',
      WETH_GATEWAY: '0xee9eE614Ad26963bEc1Bec0D2c92879ae1F209fA',
      FAUCET: '0x0b3C23243106A69449e79C14c58BB49E358f9B10',
      WALLET_BALANCE_PROVIDER: '0xEe7c0172c200e12AFEa3C34837052ec52F3f367A',
      UI_POOL_DATA_PROVIDER: '0xb36a91b1deF63B603896290F6a888c774328519A',
      UI_INCENTIVE_DATA_PROVIDER: '0x070a7D8F4d7A7A87452C5BaBaB3158e08411907E',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x7fdC1FdF79BE3309bf82f4abdAD9f111A6590C0f'.toLowerCase(),
      LENDING_POOL: '0x76cc67FF2CC77821A70ED14321111Ce381C2594D',
      WETH_GATEWAY: '0x1648C14DbB6ccdd5846969cE23DeEC4C66a03335',
      FAUCET: '0x90E5BAc5A98fff59617080848959f44eACB4Cd7B',
      WALLET_BALANCE_PROVIDER: '0x3f5A507B33260a3869878B31FB90F04F451d28e3',
      UI_POOL_DATA_PROVIDER: '0x88b4013f8C50e61ab027Cc253ab9a50663e2dF45',
      UI_INCENTIVE_DATA_PROVIDER: '0x9842E5B7b7C6cEDfB1952a388e050582Ff95645b',
    },
  },
} as const;
