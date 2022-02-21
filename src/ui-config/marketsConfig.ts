import { ChainId } from '@aave/contract-helpers';

export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  // the network the market operates on
  chainId: ChainId;
  // aToken prefix string, which will be cut of in the ui
  aTokenPrefix: string;
  enabledFeatures?: {
    liquiditySwap?: boolean;
    staking?: boolean;
    governance?: boolean;
    faucet?: boolean;
    collateralRepay?: boolean;
    incentives?: boolean;
    permissions?: boolean;
  };
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    LENDING_POOL: string;
    WETH_GATEWAY?: string;
    SWAP_COLLATERAL_ADAPTER?: string;
    REPAY_WITH_COLLATERAL_ADAPTER?: string;
    FAUCET?: string;
    PERMISSION_MANAGER?: string;
    WALLET_BALANCE_PROVIDER: string;
    /**
     * UiPoolDataProvider currently requires a non-master version
     * https://github.com/aave/protocol-v2/blob/feat/split-ui-dataprovider-logic/contracts/misc/UiPoolDataProvider.sol
     * If you deploy a market with the non default oracle or incentive controller you have to redeploy the UiPoolDataProvider as well as currently the addresses are static.
     * In the upcoming version this will no longer be needed.
     */
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER?: string;
  };
  /**
   * https://www.hal.xyz/ has integrated aave for healtfactor warning notification
   * the integration doesn't follow aave market naming & only supports a subset of markets.
   * When a halMarketName is specified a link to hal will be displayed on the ui.
   */
  halMarketName?: string;
};

export enum CustomMarket {
  proto_kovan = 'proto_kovan',
  proto_mainnet = 'proto_mainnet',
  proto_avalanche = 'proto_avalanche',
  proto_polygon = 'proto_polygon',
  proto_mumbai = 'proto_mumbai',
  amm_kovan = 'amm_kovan',
  amm_mainnet = 'amm_mainnet',
  proto_fuji = 'proto_fuji',
  proto_arbitrum_rinkeby_v3 = 'proto_arbitrum_rinkeby_v3',
  // proto_kovan_v3 = 'proto_kovan_v3',
  proto_mumbai_v3 = 'proto_mumbai_v3',
  proto_eth_rinkeby_v3 = 'proto_eth_rinkeby_v3',
  proto_fantom_testnet_v3 = 'proto_fantom_testnet_v3',
  proto_harmony_testnet_v3 = 'proto_harmony_testnet_v3',
  proto_fuji_v3 = 'proto_fuji_v3',
  proto_optimism_kovan_v3 = 'proto_optimism_kovan_v3',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_eth_rinkeby_v3]: {
    v3: true,
    marketTitle: 'Ethereum Rinkeby',
    chainId: ChainId.rinkeby,
    aTokenPrefix: 'A',
    enabledFeatures: {
      faucet: true,
      governance: false,
      staking: false,
      incentives: false,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xA55125A90d75a95EC00130E8E8C197dB5641Eb19'.toLowerCase(),
      LENDING_POOL: '0x3561c45840e2681495ACCa3c50Ef4dAe330c94F8',
      WETH_GATEWAY: '0xbE8F1f1D3f063C88027CAb4C5315219eeCEa6930',
      FAUCET: '0x25A4c18c45F4c90d3521C37c4b193187114EE321',
      WALLET_BALANCE_PROVIDER: '0x1B23D89352DF0a3808027a7D947170716BBED611',
      UI_POOL_DATA_PROVIDER: '0x407287b03D1167593AF113d32093942be13A535f',
      UI_INCENTIVE_DATA_PROVIDER: '0x0240dEBeEe7F019bfe89f752f6aeffF95a11352f',
    },
  },
  [CustomMarket.proto_kovan]: {
    marketTitle: 'Ethereum Kovan',
    chainId: ChainId.kovan,
    aTokenPrefix: 'A',
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
  [CustomMarket.proto_mainnet]: {
    marketTitle: 'Ethereum',
    chainId: ChainId.mainnet,
    aTokenPrefix: 'A',
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
      REPAY_WITH_COLLATERAL_ADAPTER: '0x498c5431eb517101582988fbb36431ddaac8f4b1',
      SWAP_COLLATERAL_ADAPTER: '0x135896DE8421be2ec868E0b811006171D9df802A',
      WALLET_BALANCE_PROVIDER: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
      UI_POOL_DATA_PROVIDER: '0x548e95Ce38B8cb1D91FD82A9F094F26295840277',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
    },
    halMarketName: 'aavev2',
  },
  [CustomMarket.amm_kovan]: {
    marketTitle: 'Ethereum AMM Kovan',
    chainId: ChainId.kovan,
    aTokenPrefix: 'AAMM',
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
  [CustomMarket.amm_mainnet]: {
    marketTitle: 'Ethereum AMM',
    chainId: ChainId.mainnet,
    aTokenPrefix: 'AAMM',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xacc030ef66f9dfeae9cbb0cd1b25654b82cfa8d5'.toLowerCase(),
      LENDING_POOL: '0x7937d4799803fbbe595ed57278bc4ca21f3bffcb',
      WETH_GATEWAY: '0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04',
      WALLET_BALANCE_PROVIDER: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
      UI_POOL_DATA_PROVIDER: '0xff115c660f57dcc19a933dbf5ba3677979adcaec',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
    },
  },
  [CustomMarket.proto_mumbai]: {
    marketTitle: 'Polygon Mumbai',
    chainId: ChainId.mumbai,
    aTokenPrefix: 'AM',
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
  [CustomMarket.proto_mumbai_v3]: {
    marketTitle: 'Polygon Mumbai',
    chainId: ChainId.mumbai,
    aTokenPrefix: 'AM',
    enabledFeatures: {
      incentives: true,
      faucet: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xA5375B08232a0f5e911c8a92B390662e098a579A'.toLowerCase(),
      LENDING_POOL: '0xEce3383269ccE0B2ae66277101996b58c482817B',
      WETH_GATEWAY: '0x9BBA071d1f2A397Da82687e951bFC0407280E348',
      FAUCET: '0xE341D799E61d9caDBB6b05539f1d10aAdfA24d70',
      WALLET_BALANCE_PROVIDER: '0x63F0F2d9C338cA14ffb6D611df7d62710D13EBEF',
      UI_POOL_DATA_PROVIDER: '0x7C376eBA9e0dDC8c71Be7875618056a0bc071d0e',
      UI_INCENTIVE_DATA_PROVIDER: '0xA702C5Fe370734D38060621e05215C70e0A6939E',
    },
    v3: true,
  },
  [CustomMarket.proto_polygon]: {
    marketTitle: 'Polygon',
    chainId: ChainId.polygon,
    aTokenPrefix: 'AM',
    enabledFeatures: {
      liquiditySwap: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xd05e3E715d945B59290df0ae8eF85c1BdB684744'.toLowerCase(),
      LENDING_POOL: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
      WETH_GATEWAY: '0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97',
      SWAP_COLLATERAL_ADAPTER: '0x35784a624D4FfBC3594f4d16fA3801FeF063241c',
      WALLET_BALANCE_PROVIDER: '0x34aa032bC416Cf2CdC45c0C8f065b1F19463D43e',
      UI_POOL_DATA_PROVIDER: '0x67acdB3469580185811E5769113509c6e8B6Cba5',
      UI_INCENTIVE_DATA_PROVIDER: '0x645654D59A5226CBab969b1f5431aA47CBf64ab8',
    },
    halMarketName: 'aavepolygon',
  },
  [CustomMarket.proto_fuji]: {
    marketTitle: 'Avalanche Fuji',
    chainId: ChainId.fuji,
    aTokenPrefix: 'AAVA',
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
    aTokenPrefix: 'AV',
    enabledFeatures: {
      liquiditySwap: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xb6A86025F0FE1862B372cb0ca18CE3EDe02A318f'.toLowerCase(),
      LENDING_POOL: '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C',
      WETH_GATEWAY: '0x8a47F74d1eE0e2edEB4F3A7e64EF3bD8e11D27C8',
      SWAP_COLLATERAL_ADAPTER: '0x2EcF2a2e74B19Aab2a62312167aFF4B78E93B6C5',
      WALLET_BALANCE_PROVIDER: '0x73e4898a1Bfa9f710B6A6AB516403A6299e01fc6',
      UI_POOL_DATA_PROVIDER: '0x88be7eC36719fadAbdE4307ec61EAB6fda788CEF',
      UI_INCENTIVE_DATA_PROVIDER: '0x11979886A6dBAE27D7a72c49fCF3F23240D647bF',
    },
    halMarketName: 'aaveavalanche',
  },
  [CustomMarket.proto_arbitrum_rinkeby_v3]: {
    marketTitle: 'Arbitrum Rinkeby',
    v3: true,
    chainId: ChainId.arbitrum_rinkeby,
    aTokenPrefix: 'AA',
    enabledFeatures: {
      faucet: true,
      incentives: false,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xA5375B08232a0f5e911c8a92B390662e098a579A'.toLowerCase(),
      LENDING_POOL: '0xEce3383269ccE0B2ae66277101996b58c482817B',
      WETH_GATEWAY: '0x9BBA071d1f2A397Da82687e951bFC0407280E348',
      FAUCET: '0x02444D214962eC73ab733bB00Ca98879efAAa73d',
      WALLET_BALANCE_PROVIDER: '0x63F0F2d9C338cA14ffb6D611df7d62710D13EBEF',
      UI_POOL_DATA_PROVIDER: '0x1931722c81F8A6b27d21a8Abfc167134D2F1a790',
      UI_INCENTIVE_DATA_PROVIDER: '0xA702C5Fe370734D38060621e05215C70e0A6939E',
    },
  },
  [CustomMarket.proto_fuji_v3]: {
    marketTitle: 'Avalanche Fuji',
    v3: true,
    chainId: ChainId.fuji,
    aTokenPrefix: 'AAVA',
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xd5B55D3Ed89FDa19124ceB5baB620328287b915d'.toLowerCase(),
      LENDING_POOL: '0xC4744c984975ab7d41e0dF4B37E048Ef8006115E',
      WETH_GATEWAY: '0x7e3d807Cb61745A75e375161E13970633B947356',
      FAUCET: '0x5665007321915c8f0E72d041315bA1AD15065337',
      WALLET_BALANCE_PROVIDER: '0xC87385b5E62099f92d490750Fcd6C901a524BBcA',
      UI_POOL_DATA_PROVIDER: '0x4C81F1dE56eB8Cfd7Eb3c64A79C5Bb15a3999eD5',
      UI_INCENTIVE_DATA_PROVIDER: '0x535817805258A4E5924dBE6AE66F9335C94Ffef3',
    },
  },
  [CustomMarket.proto_harmony_testnet_v3]: {
    marketTitle: 'Harmony Testnet',
    v3: true,
    chainId: ChainId.harmony_testnet,
    aTokenPrefix: 'AAVA',
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xA5375B08232a0f5e911c8a92B390662e098a579A'.toLowerCase(),
      LENDING_POOL: '0xEce3383269ccE0B2ae66277101996b58c482817B',
      WETH_GATEWAY: '0x9BBA071d1f2A397Da82687e951bFC0407280E348',
      FAUCET: '0xE341D799E61d9caDBB6b05539f1d10aAdfA24d70',
      WALLET_BALANCE_PROVIDER: '0x63F0F2d9C338cA14ffb6D611df7d62710D13EBEF',
      UI_POOL_DATA_PROVIDER: '0x7C376eBA9e0dDC8c71Be7875618056a0bc071d0e',
      UI_INCENTIVE_DATA_PROVIDER: '0xA702C5Fe370734D38060621e05215C70e0A6939E',
    },
  },
  [CustomMarket.proto_fantom_testnet_v3]: {
    marketTitle: 'Fantom Testnet',
    v3: true,
    chainId: ChainId.fantom_testnet,
    aTokenPrefix: 'AAVA',
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xD90db1ca5A6e9873BCD9B0279AE038272b656728'.toLowerCase(),
      LENDING_POOL: '0x7ec6c938AbD22cC309bD9be313CB229569E11e81',
      WETH_GATEWAY: '0x56e0507A53Ee252947a1E55D84Dc4032F914DD98',
      FAUCET: '0xFc7215C9498Fc12b22Bc0ed335871Db4315f03d3',
      WALLET_BALANCE_PROVIDER: '0x302567472401C7c7B50ee7eb3418c375D8E3F728',
      UI_POOL_DATA_PROVIDER: '0x237f409fBD10E30e237d63d9050Ae302e339028E',
      UI_INCENTIVE_DATA_PROVIDER: '0xBaaCc99123133851Ba2D6d34952aa08CBDf5A4E4',
    },
  },
  [CustomMarket.proto_optimism_kovan_v3]: {
    marketTitle: 'Optimism Kovan',
    v3: true,
    chainId: ChainId.optimism_kovan,
    aTokenPrefix: 'AAVA',
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xFc7215C9498Fc12b22Bc0ed335871Db4315f03d3'.toLowerCase(),
      LENDING_POOL: '0x3Ee0444c892aAD6B225Ef20551116f79C52554AA',
      WETH_GATEWAY: '0x3e4b51076d7e9B844B92F8c6377087f9cf8C8696',
      FAUCET: '0x407287b03D1167593AF113d32093942be13A535f',
      WALLET_BALANCE_PROVIDER: '0xdDc3C9B8614092e6188A86450c8D597509893E20',
      UI_POOL_DATA_PROVIDER: '0x9D2729bC36f9E203002Bc5B5ee2E08C68Bd13794',
      UI_INCENTIVE_DATA_PROVIDER: '0x8AaF462990dD5CC574c94C8266208996426A47e7',
    },
  },
} as const;
