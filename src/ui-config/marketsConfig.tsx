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
  // v3 test networks
  proto_arbitrum_rinkeby_v3 = 'proto_arbitrum_rinkeby_v3',
  proto_arbitrum_goerli_v3 = 'proto_arbitrum_goerli_v3',
  proto_mumbai_v3 = 'proto_mumbai_v3',
  proto_fantom_testnet_v3 = 'proto_fantom_testnet_v3',
  proto_harmony_testnet_v3 = 'proto_harmony_testnet_v3',
  proto_fuji_v3 = 'proto_fuji_v3',
  proto_goerli_v3 = 'proto_goerli_v3',
  proto_optimism_kovan_v3 = 'proto_optimism_kovan_v3',
  proto_optimism_goerli_v3 = 'proto_optimism_goerli_v3',
  // v3 mainnets
  proto_optimism_v3 = 'proto_optimism_v3',
  proto_fantom_v3 = 'proto_fantom_v3',
  proto_harmony_v3 = 'proto_harmony_v3',
  proto_avalanche_v3 = 'proto_avalanche_v3',
  proto_polygon_v3 = 'proto_polygon_v3',
  proto_arbitrum_v3 = 'proto_arbitrum_v3',
  // v2
  proto_mainnet = 'proto_mainnet',
  proto_avalanche = 'proto_avalanche',
  proto_fuji = 'proto_fuji',
  proto_polygon = 'proto_polygon',
  proto_mumbai = 'proto_mumbai',
  amm_mainnet = 'amm_mainnet',
  //proto_goerli = 'proto_goerli',
  proto_kovan = 'proto_kovan',
  amm_kovan = 'amm_kovan',
  // external
  // permissioned_market = 'permissioned_market',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_kovan]: {
    marketTitle: 'Ethereum Kovan',
    chainId: ChainId.kovan,
    enabledFeatures: {
      faucet: true,
      governance: true,
      staking: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x88757f2f99175387ab4c6a4b3067c77a695b0349'.toLowerCase(),
      LENDING_POOL: '0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe',
      WETH_GATEWAY: '0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70',
      FAUCET: '0x600103d518cC5E8f3319D532eB4e5C268D32e604',
      WALLET_BALANCE_PROVIDER: '0x07DC923859b68e9399d787bf52c4Aa9eBe3490aF',
      UI_POOL_DATA_PROVIDER: '0x0D410Ce47834798028c9CD894A29A4b12A9d5624',
      UI_INCENTIVE_DATA_PROVIDER: '0x50e468e1AAF408a2EB4614e4b45f832700Cda7F4',
    },
  },
  [CustomMarket.amm_kovan]: {
    marketTitle: 'Ethereum AMM Kovan',
    chainId: ChainId.kovan,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x67FB118A780fD740C8936511947cC4bE7bb7730c'.toLowerCase(),
      LENDING_POOL: '0x762E2a3BBe729240ea44D31D5a81EAB44d34ef01',
      WETH_GATEWAY: '0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70',
      FAUCET: '0x600103d518cC5E8f3319D532eB4e5C268D32e604',
      WALLET_BALANCE_PROVIDER: '0x07DC923859b68e9399d787bf52c4Aa9eBe3490aF',
      UI_POOL_DATA_PROVIDER: '0x31fe1309B1169e7136AdAB01d4ba3882b5852d08',
      UI_INCENTIVE_DATA_PROVIDER: '0x50e468e1AAF408a2EB4614e4b45f832700Cda7F4',
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
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'.toLowerCase(),
      LENDING_POOL: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      WETH_GATEWAY: '0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x80Aca0C645fEdABaa20fd2Bf0Daf57885A309FE6',
      SWAP_COLLATERAL_ADAPTER: '0x135896DE8421be2ec868E0b811006171D9df802A',
      WALLET_BALANCE_PROVIDER: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
      UI_POOL_DATA_PROVIDER: '0x548e95Ce38B8cb1D91FD82A9F094F26295840277',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
      COLLECTOR: '0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c',
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
      marketName: 'aavev2',
    },
  },
  // [CustomMarket.proto_goerli]: {
  //   marketTitle: 'Ethereum Görli',
  //   chainId: ChainId.goerli,
  //   enabledFeatures: {
  //   faucet: true,
  //   },
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: ''.toLowerCase(),
  //     LENDING_POOL: '',
  //     WETH_GATEWAY: '',
  //     WALLET_BALANCE_PROVIDER: '',
  //     UI_POOL_DATA_PROVIDER: '',
  //     UI_INCENTIVE_DATA_PROVIDER: '',
  //  },
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
      WETH_GATEWAY: '0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04',
      WALLET_BALANCE_PROVIDER: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
      UI_POOL_DATA_PROVIDER: '0x548e95Ce38B8cb1D91FD82A9F094F26295840277',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
      COLLECTOR: '0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c',
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
      UI_POOL_DATA_PROVIDER: '0x20b3ebe9cd42806bb3bbf66b0378215ac2df2a61',
      UI_INCENTIVE_DATA_PROVIDER: '0x070a7D8F4d7A7A87452C5BaBaB3158e08411907E',
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
      WETH_GATEWAY: '0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97',
      SWAP_COLLATERAL_ADAPTER: '0x35784a624D4FfBC3594f4d16fA3801FeF063241c',
      REPAY_WITH_COLLATERAL_ADAPTER: '0xE84cF064a0a65290Ae5673b500699f3753063936',
      WALLET_BALANCE_PROVIDER: '0x34aa032bC416Cf2CdC45c0C8f065b1F19463D43e',
      UI_POOL_DATA_PROVIDER: '0x67acdB3469580185811E5769113509c6e8B6Cba5',
      UI_INCENTIVE_DATA_PROVIDER: '0x645654D59A5226CBab969b1f5431aA47CBf64ab8',
      COLLECTOR: '0x7734280A4337F37Fbf4651073Db7c28C80B339e9',
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
      marketName: 'aavepolygon',
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
      UI_POOL_DATA_PROVIDER: '0xFC2567b058dBd1Eb4F36d4247C74d422C03aC477',
      UI_INCENTIVE_DATA_PROVIDER: '0x9842E5B7b7C6cEDfB1952a388e050582Ff95645b',
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
      WETH_GATEWAY: '0x8a47F74d1eE0e2edEB4F3A7e64EF3bD8e11D27C8',
      SWAP_COLLATERAL_ADAPTER: '0x2EcF2a2e74B19Aab2a62312167aFF4B78E93B6C5',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x935b362EE3E1f342cc48118C528AAbee5118F6e6',
      WALLET_BALANCE_PROVIDER: '0x73e4898a1Bfa9f710B6A6AB516403A6299e01fc6',
      UI_POOL_DATA_PROVIDER: '0x88be7eC36719fadAbdE4307ec61EAB6fda788CEF',
      UI_INCENTIVE_DATA_PROVIDER: '0x11979886A6dBAE27D7a72c49fCF3F23240D647bF',
      COLLECTOR: '0x467b92aF281d14cB6809913AD016a607b5ba8A36',
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
      // Note: We should remove this based on the addresses that you provide in the addresses below
      faucet: true,
      // governance: true,
      // staking: true,
      // incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D'.toLowerCase(),
      LENDING_POOL: '0x368EedF3f56ad10b9bC57eed4Dac65B26Bb667f6',
      WETH_GATEWAY: '0xd5B55D3Ed89FDa19124ceB5baB620328287b915d',
      FAUCET: '0x1ca525Cd5Cb77DB5Fa9cBbA02A0824e283469DBe',
      WALLET_BALANCE_PROVIDER: '0x75CC0f0E3764be7594772D08EEBc322970CbB3a9',
      UI_POOL_DATA_PROVIDER: '0x851F44e30C469b9E4Bf9591309611c28eAb85fAb',
      UI_INCENTIVE_DATA_PROVIDER: '0x2A15b87783b9d590a6c528E7b1Df71ee73540F5A',
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
      WETH_GATEWAY: '0xC09e69E79106861dF5d289dA88349f10e2dc6b5C',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0x3f960bB91e85Ae2dB561BDd01B515C5A5c65802b',
      UI_INCENTIVE_DATA_PROVIDER: '0xEFdd7374551897B11a23Ec7b5694C713DFDa76f1',
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
  [CustomMarket.proto_arbitrum_rinkeby_v3]: {
    marketTitle: 'Arbitrum Rinkeby',
    v3: true,
    chainId: ChainId.arbitrum_rinkeby,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xF7158D1412Bdc8EAfc6BF97DB4e2178379c9521c'.toLowerCase(),
      LENDING_POOL: '0x9C55a3C34de5fd46004Fa44a55490108f7cE388F',
      WETH_GATEWAY: '0xF1C72f4e230289970d60046915c79c4A7A94aae5',
      FAUCET: '0x3BE25d21ee1C417462E97CEF1D53da9011149384',
      WALLET_BALANCE_PROVIDER: '0xA1B434CC7B9Cf70BE99f19B3721904919CaA5227',
      UI_POOL_DATA_PROVIDER: '0xa3D26e300df5Aa91713fB5963A6A6C48777243Aa',
      UI_INCENTIVE_DATA_PROVIDER: '0x8E90a6524931E097DefB662B3DEa33809D410E6c',
      L2_ENCODER: '0x3d0d309DC8f999f34c4E7296dB38F0e65D3115DF',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xF8aa90E66B8BAe13f2e4aDe6104abAb8eeDaBfdc'.toLowerCase(),
      LENDING_POOL: '0x6Cbb4E8eC402E07fDF96DbbC6c752aCfB0eB6075',
      WETH_GATEWAY: '0xBCca2fc5F30A65cE2155d739364f3fc8F57E6999',
      FAUCET: '0x98256500C9f1CE77e4C925b7bbF1588515E34422',
      WALLET_BALANCE_PROVIDER: '0xA0025bE90591971ad76D12F8c9CecA09f66db3D8',
      UI_POOL_DATA_PROVIDER: '0xd5dE38432Ef93B574B5eAbeBaa8F92bB480dD14F',
      UI_INCENTIVE_DATA_PROVIDER: '0x71af6535f74Ac34e61a0Df6221ec0442b512eBC1',
      L2_ENCODER: '0xBFB521464727c3B31A6D9183413cc2B66f4F6686',
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
      WETH_GATEWAY: '0xa938d8536aEed1Bd48f548380394Ab30Aa11B00E',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x8a743090e9759E758d15a4CFd18408fb6332c625',
      SWAP_COLLATERAL_ADAPTER: '0xF7fC20D9D1D8DFE55F5F2c3180272a5747dD327F',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0xdBbFaFC45983B4659E368a3025b81f69Ab6E5093',
      UI_INCENTIVE_DATA_PROVIDER: '0x270f51cf3F681010B46f5c4Ee2aD5120Db33026F',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29'.toLowerCase(),
      LENDING_POOL: '0xb47673b7a73D78743AFF1487AF69dBB5763F00cA',
      WETH_GATEWAY: '0x8f57153F18b7273f9A814b93b31Cb3f9b035e7C2',
      FAUCET: '0x127277bF2F5fA186bfC6b3a0ca00baefB5472d3a',
      WALLET_BALANCE_PROVIDER: '0xd19443202328A66875a51560c28276868B8C61C2',
      UI_POOL_DATA_PROVIDER: '0x1D01f7d8B42Ec47837966732f831E1D6321df499',
      UI_INCENTIVE_DATA_PROVIDER: '0x036dDd300B57F6a8A6A55e2ede8b50b517A5094f',
    },
  },
  [CustomMarket.proto_optimism_kovan_v3]: {
    marketTitle: 'Optimism Kovan',
    v3: true,
    chainId: ChainId.optimism_kovan,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xD15d36975A0200D11B8a8964F4F267982D2a1cFe'.toLowerCase(),
      LENDING_POOL: '0x139d8F557f70D1903787e929D7C42165c4667229',
      WETH_GATEWAY: '0x698851Fc324Ff9572289Dd72dfC102DB778b52f1',
      FAUCET: '0xed97140B58B97FaF70b70Ae26714Aa59705c74aE',
      WALLET_BALANCE_PROVIDER: '0xA8751C0e2383cE144a95386A2E30f7E2BD78236C',
      UI_POOL_DATA_PROVIDER: '0xBCb61ecc7997cc736E4802de2D5ce76D0908C97c',
      UI_INCENTIVE_DATA_PROVIDER: '0xe2E3a30E77469397dc3CF74f1Fa35f39493207C2',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x74a328ED938160D702378Daeb7aB2504714B4E4b'.toLowerCase(),
      LENDING_POOL: '0x4b529A5d8268d74B687aC3dbb00e1b85bF4BF0d4',
      WETH_GATEWAY: '0x6f7f2440006221F893c587b88f01afc42B6F8d2e',
      FAUCET: '0xC52eA1F19C22E5a3725105BC0cf4988614e84D98',
      WALLET_BALANCE_PROVIDER: '0xAEe1FD5CB505aa48E49c01DdE732956eDef8b42f',
      UI_POOL_DATA_PROVIDER: '0x4D8201fB7a3367AB3e4Ba257F7462C81306799d6',
      UI_INCENTIVE_DATA_PROVIDER: '0x596b5804E1f541baC5f265aF7C4bcc5077522876',
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
      WETH_GATEWAY: '0x17d013C19FE25cf4D911CE85eD5f40FE8880F46f',
      SWAP_COLLATERAL_ADAPTER: '0xe387c6053ce8ec9f8c3fa5ce085af73114a695d3',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x1408401B2A7E28cB747b3e258D0831Fc926bAC51',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0x1CCbfeC508da8D5242D5C1b368694Ab0066b39f1',
      UI_INCENTIVE_DATA_PROVIDER: '0xbA14c06011f4AF5970cFDe4364ba6320E190BD4B',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xE339D30cBa24C70dCCb82B234589E3C83249e658'.toLowerCase(),
      LENDING_POOL: '0x771A45a19cE333a19356694C5fc80c76fe9bc741',
      WETH_GATEWAY: '0x87770f04Bbece8092d777860907798138825f303',
      FAUCET: '0x02D538e56A729C535F83b2DA20Ddf9AD7281FE6c',
      WALLET_BALANCE_PROVIDER: '0xBb3F2bB6126b0709F738cbe6B50bFE69fd663e73',
      UI_POOL_DATA_PROVIDER: '0xd0B607bb9e0aA3aFF73a8E99d7EfA54C4bc3d8a9',
      UI_INCENTIVE_DATA_PROVIDER: '0x7Ce8eA134935F9FED1606Ba0dfD0509fec5D3a75',
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
      WETH_GATEWAY: '0xe86B52cE2e4068AdE71510352807597408998a69',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0xBC3c351349f6A919A419EE1e57F85f3e07E59dd1',
      UI_INCENTIVE_DATA_PROVIDER: '0xC09e69E79106861dF5d289dA88349f10e2dc6b5C',
      COLLECTOR: '0x8A020d92D6B119978582BE4d3EdFdC9F7b28BF31',
    },
  },
  [CustomMarket.proto_harmony_testnet_v3]: {
    marketTitle: 'Harmony Testnet',
    v3: true,
    chainId: ChainId.harmony_testnet,
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xd19443202328A66875a51560c28276868B8C61C2'.toLowerCase(),
      LENDING_POOL: '0x85C1F3f1bB439180f7Bfda9DFD61De82e10bD554',
      WETH_GATEWAY: '0xdDc3C9B8614092e6188A86450c8D597509893E20',
      FAUCET: '0x8f57153F18b7273f9A814b93b31Cb3f9b035e7C2',
      WALLET_BALANCE_PROVIDER: '0x8AaF462990dD5CC574c94C8266208996426A47e7',
      UI_POOL_DATA_PROVIDER: '0x56e0507A53Ee252947a1E55D84Dc4032F914DD98',
      UI_INCENTIVE_DATA_PROVIDER: '0xE3981f4840843D67aF50026d34DA0f7e56A02D69',
    },
  },
  [CustomMarket.proto_optimism_v3]: {
    marketTitle: 'Optimism',
    v3: true,
    chainId: ChainId.optimism,
    enabledFeatures: {
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb'.toLowerCase(),
      LENDING_POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      WETH_GATEWAY: '0x86b4D2636EC473AC4A5dD83Fc2BEDa98845249A7',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0x64f558d4BFC1c03a8c8B2ff84976fF04c762b51f',
      UI_INCENTIVE_DATA_PROVIDER: '0x6dD4b295B457A26CC2646aAf2519436681afb5d4',
      L2_ENCODER: '0x9abADECD08572e0eA5aF4d47A9C7984a5AA503dC',
      COLLECTOR: '0xB2289E329D2F85F1eD31Adbb30eA345278F21bcf',
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
      WETH_GATEWAY: '0x9BdB5fcc80A49640c7872ac089Cc0e00A98451B6',
      REPAY_WITH_COLLATERAL_ADAPTER: '0xA125561fca253f19eA93970534Bb0364ea74187a',
      SWAP_COLLATERAL_ADAPTER: '0x301F221bc732907E2da2dbBFaA8F8F6847c170c3',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0x8F1AD487C9413d7e81aB5B4E88B024Ae3b5637D0',
      UI_INCENTIVE_DATA_PROVIDER: '0x05E309C97317d8abc0f7e78185FC966FfbD2CEC0',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6'.toLowerCase(),
      LENDING_POOL: '0x6C9fB0D5bD9429eb9Cd96B85B81d872281771E6B',
      WETH_GATEWAY: '0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17',
      FAUCET: '0xc1eB89DA925cc2Ae8B36818d26E12DDF8F8601b0',
      WALLET_BALANCE_PROVIDER: '0x78baC31Ed73c115EB7067d1AfE75eC7B4e16Df9e',
      UI_POOL_DATA_PROVIDER: '0x94E9E8876Fd68574f17B2cd7Fa19AA8342fFaF51',
      UI_INCENTIVE_DATA_PROVIDER: '0xD4b6566313c1dCd8823226bb456d80fc85B03d8B',
    },
    v3: true,
  },
} as const;
