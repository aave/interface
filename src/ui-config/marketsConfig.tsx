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
  proto_arbitrum_goerli_v3 = 'proto_arbitrum_goerli_v3',
  proto_mumbai_v3 = 'proto_mumbai_v3',
  proto_fantom_testnet_v3 = 'proto_fantom_testnet_v3',
  proto_fuji_v3 = 'proto_fuji_v3',
  proto_goerli_v3 = 'proto_goerli_v3',
  proto_optimism_goerli_v3 = 'proto_optimism_goerli_v3',
  proto_goerli_gho_v3 = 'proto_goerli_gho_v3',
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
  proto_goerli = 'proto_goerli',
  // external
  // permissioned_market = 'permissioned_market',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
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
      UI_POOL_DATA_PROVIDER: '0x30375522F67a6308630d49A694ca1491fA2D3BC6',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
      COLLECTOR: '0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c',
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
      UI_POOL_DATA_PROVIDER: '0x30375522F67a6308630d49A694ca1491fA2D3BC6',
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
      UI_POOL_DATA_PROVIDER: '0x0d24b23DBaB0dc1A6F58029bA94F94Ff0D5382c2',
      UI_INCENTIVE_DATA_PROVIDER: '0x645654D59A5226CBab969b1f5431aA47CBf64ab8',
      COLLECTOR: '0x7734280A4337F37Fbf4651073Db7c28C80B339e9',
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
      UI_POOL_DATA_PROVIDER: '0xa7da242e099136A71fF975B8D78b79AA543c9182',
      UI_INCENTIVE_DATA_PROVIDER: '0x11979886A6dBAE27D7a72c49fCF3F23240D647bF',
      COLLECTOR: '0x467b92aF281d14cB6809913AD016a607b5ba8A36',
    },
    halIntegration: {
      URL: 'https://app.hal.xyz/recipes/aave-track-your-health-factor',
      marketName: 'aaveavalanche',
    },
  },
  // v3
  [CustomMarket.proto_goerli_gho_v3]: {
    marketTitle: 'Ethereum Görli GHO',
    v3: true,
    chainId: ChainId.goerli,
    enabledFeatures: {
      // Note: We should remove this based on the addresses that you provide in the addresses below
      faucet: true,
      // governance: true,
      staking: true,
      // incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x3c1095AC5c30042453a07414bAFB2501dE30A8fe'.toLowerCase(),
      LENDING_POOL: '0xd84f166e81f53eDd9B689779B6f4022cF73A2BdF',
      WETH_GATEWAY: '0xaba1AC875611E6BEF8a9F6e9166C35C07A56E90b',
      FAUCET: '0xD7974dCc0a0Bd2d4eeBF00B270634E40b9f8f967',
      WALLET_BALANCE_PROVIDER: '0x11De99932D5B08E8A680B80e4eC7Bd68851fD64b',
      UI_POOL_DATA_PROVIDER: '0xC576539371a2f425545B7BF4eb2a14Eee1944a1C',
      UI_INCENTIVE_DATA_PROVIDER: '0xACFd610B51ac6B70F030B277EA8A2A8D2143dC7A',
    },
  },
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
      UI_POOL_DATA_PROVIDER: '0xC576539371a2f425545B7BF4eb2a14Eee1944a1C',
      UI_INCENTIVE_DATA_PROVIDER: '0xACFd610B51ac6B70F030B277EA8A2A8D2143dC7A',
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
      UI_POOL_DATA_PROVIDER: '0x85272bf6DdCCBDea45Cf0535ea5C65bf91B480c4',
      UI_INCENTIVE_DATA_PROVIDER: '0x35DDe5599318112829d97A29f4E8f4C49aAfc47C',
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
      LENDING_POOL_ADDRESS_PROVIDER: '0xF8aa90E66B8BAe13f2e4aDe6104abAb8eeDaBfdc'.toLowerCase(),
      LENDING_POOL: '0x6Cbb4E8eC402E07fDF96DbbC6c752aCfB0eB6075',
      WETH_GATEWAY: '0xBCca2fc5F30A65cE2155d739364f3fc8F57E6999',
      FAUCET: '0x98256500C9f1CE77e4C925b7bbF1588515E34422',
      WALLET_BALANCE_PROVIDER: '0xA0025bE90591971ad76D12F8c9CecA09f66db3D8',
      UI_POOL_DATA_PROVIDER: '0xDf8470D702Cc63c510eeD4b5322896aAf92F4F1D',
      UI_INCENTIVE_DATA_PROVIDER: '0xcBc599F81ece6C3f60907400A142459596898DAD',
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
      WETH_GATEWAY: '0x6F143FE2F7B02424ad3CaD1593D6f36c0Aab69d7',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x8a743090e9759E758d15a4CFd18408fb6332c625',
      SWAP_COLLATERAL_ADAPTER: '0xF7fC20D9D1D8DFE55F5F2c3180272a5747dD327F',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0x1dDAF95C8f58d1283E9aE5e3C964b575D7cF7aE3',
      UI_INCENTIVE_DATA_PROVIDER: '0x70371a494f73A8Df658C5cd29E2C1601787e1009',
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
      UI_POOL_DATA_PROVIDER: '0x88138CA1e9E485A1E688b030F85Bb79d63f156BA',
      UI_INCENTIVE_DATA_PROVIDER: '0x7eEB186F13538e6795a0823e2D7283FEeD2738f5',
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
      UI_POOL_DATA_PROVIDER: '0x7F2CEE177943bBa0C27e77C8F7893A27B4E0F740',
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
      WETH_GATEWAY: '0x1DcDA4de2Bf6c7AD9a34788D22aE6b7d55016e1f',
      SWAP_COLLATERAL_ADAPTER: '0xe387c6053ce8ec9f8c3fa5ce085af73114a695d3',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x1408401B2A7E28cB747b3e258D0831Fc926bAC51',
      WALLET_BALANCE_PROVIDER: '0xBc790382B3686abffE4be14A030A96aC6154023a',
      UI_POOL_DATA_PROVIDER: '0x46E1b32fA843da745D7AA0ae630b544D6af9fe81',
      UI_INCENTIVE_DATA_PROVIDER: '0x881c17956e29e4D5264162B6C2D7F5b2E6de4d54',
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
      UI_POOL_DATA_PROVIDER: '0xBCb61ecc7997cc736E4802de2D5ce76D0908C97c',
      UI_INCENTIVE_DATA_PROVIDER: '0xe2E3a30E77469397dc3CF74f1Fa35f39493207C2',
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
      UI_POOL_DATA_PROVIDER: '0xf952959c0F7FBed55786749219FECd8cd0ec8441',
      UI_INCENTIVE_DATA_PROVIDER: '0x027f58ea3B4c81c1ceeFAdE9c56375545a6E75F4',
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
      UI_POOL_DATA_PROVIDER: '0x472337F1C9c1C5497c23dD8060df8729f33b5543',
      UI_INCENTIVE_DATA_PROVIDER: '0x44b864b92043a960313F3C94BD6DB4dA202814F6',
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
      UI_POOL_DATA_PROVIDER: '0x7006e5a16E449123a3F26920746d03337ff37340',
      UI_INCENTIVE_DATA_PROVIDER: '0xF43EfC9789736BaF550DC016C7389210c43e7997',
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
      UI_POOL_DATA_PROVIDER: '0x74E3445f239f9915D57715Efb810f67b2a7E5758',
      UI_INCENTIVE_DATA_PROVIDER: '0x26C3249723F2b98be57F49a1a31A9243a4B2cd88',
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
      UI_POOL_DATA_PROVIDER: '0xcCb7a1B6B5D72c4AA633B114537cD20612fDccbB',
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
      UI_POOL_DATA_PROVIDER: '0x71ABaeBCA33Dac8CbF99790DF3c72b42908b8E43',
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
      UI_POOL_DATA_PROVIDER: '0xBA6378f1c1D046e9EB0F538560BA7558546edF3C',
      UI_INCENTIVE_DATA_PROVIDER: '0x9842E5B7b7C6cEDfB1952a388e050582Ff95645b',
    },
  },
} as const;
