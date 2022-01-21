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
};

export enum CustomMarket {
  proto_kovan = 'proto_kovan',
  proto_mainnet = 'proto_mainnet',
  proto_avalanche = 'proto_avalanche',
  proto_matic = 'proto_matic',
  proto_mumbai = 'proto_mumbai',
  amm_kovan = 'amm_kovan',
  amm_mainnet = 'amm_mainnet',
  proto_fuji = 'proto_fuji',
  proto_arbitrum_rinkeby = 'proto_arbitrum_rinkeby',
  proto_kovan_v3 = 'proto_kovan_v3',
  proto_eth_rinkeby_v3 = 'proto_eth_rinkeby_v3',
  proto_fantom_testnet = 'proto_fantom_testnet',
  proto_harmony_testnet = 'proto_harmony_testnet',
  proto_fuji_v3 = 'proto_fuji_v3',
  // proto_optimism_kovan = 'proto_optimism_kovan',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_kovan_v3]: {
    v3: true,
    marketTitle: 'V3 market',
    chainId: ChainId.kovan,
    aTokenPrefix: 'A',
    enabledFeatures: {
      faucet: true,
      governance: true,
      staking: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xE5fb10674949D25c8df1aD5B064554475D800aBE'.toLowerCase(),
      LENDING_POOL: '0xA95500B7Aaa860429e8Ee123CDD4422A92d253Cb',
      WETH_GATEWAY: '0x3Cc4f2F748E0E74ec99D72913213DAb2Bd52b4e2',
      FAUCET: '0x606c081bcB46fe370Dc3C72ceD2aD5004B58f14B',
      WALLET_BALANCE_PROVIDER: '0x1A7bD4385E2368605bEd6C30d93dEb616Ff2C820',
      UI_POOL_DATA_PROVIDER: '0xc0D742D3a10DFC75911Fd320927297db346EEA1e',
      UI_INCENTIVE_DATA_PROVIDER: '0xceD5e96CD06B2D2839D7171BD46546b22b53AFab',
    },
  },
  [CustomMarket.proto_eth_rinkeby_v3]: {
    v3: true,
    marketTitle: 'V3 market',
    chainId: ChainId.rinkeby,
    aTokenPrefix: 'A',
    enabledFeatures: {
      faucet: true,
      governance: false,
      staking: false,
      incentives: false,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xf4C5dF4e991C9d0E59723E4eB872B48f3E44EDc9'.toLowerCase(),
      LENDING_POOL: '0x465603b96f0311a5380963aE5B91c0e09ECAa3bC',
      WETH_GATEWAY: '0x14Aa3cFaBb7BA11c8A72f89585373c023EE1aF06',
      FAUCET: '0x1271EC102feB25Af74Aaf7575B7428E7Ae2A5a3a',
      WALLET_BALANCE_PROVIDER: '0xd32c9e7340d4269e1395ee6a15b21049120B4d26',
      UI_POOL_DATA_PROVIDER: '0x74a90a5e995289e3b391eBafF5dE51fF43193BB5',
    },
  },
  [CustomMarket.proto_kovan]: {
    marketTitle: 'market',
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
      UI_POOL_DATA_PROVIDER: '0x0ac904C17FB9674D1441d7a44a97D14D116A6e22',
      UI_INCENTIVE_DATA_PROVIDER: '0x50e468e1AAF408a2EB4614e4b45f832700Cda7F4',
    },
  },
  [CustomMarket.proto_mainnet]: {
    marketTitle: 'market',
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
      UI_POOL_DATA_PROVIDER: '0xa2DC1422E0cE89E1074A6cd7e2481e8e9c4415A6',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
    },
  },
  [CustomMarket.amm_kovan]: {
    marketTitle: 'AMM market',
    chainId: ChainId.kovan,
    aTokenPrefix: 'AAMM',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x67FB118A780fD740C8936511947cC4bE7bb7730c'.toLowerCase(),
      LENDING_POOL: '0x762E2a3BBe729240ea44D31D5a81EAB44d34ef01',
      WETH_GATEWAY: '0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70',
      FAUCET: '0x600103d518cC5E8f3319D532eB4e5C268D32e604',
      WALLET_BALANCE_PROVIDER: '0x07DC923859b68e9399d787bf52c4Aa9eBe3490aF',
      UI_POOL_DATA_PROVIDER: '0x0ac904C17FB9674D1441d7a44a97D14D116A6e22',
      UI_INCENTIVE_DATA_PROVIDER: '0x50e468e1AAF408a2EB4614e4b45f832700Cda7F4',
    },
  },
  [CustomMarket.amm_mainnet]: {
    marketTitle: 'AMM market',
    chainId: ChainId.mainnet,
    aTokenPrefix: 'AAMM',
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xacc030ef66f9dfeae9cbb0cd1b25654b82cfa8d5'.toLowerCase(),
      LENDING_POOL: '0x7937d4799803fbbe595ed57278bc4ca21f3bffcb',
      WETH_GATEWAY: '0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04',
      WALLET_BALANCE_PROVIDER: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
      UI_POOL_DATA_PROVIDER: '0xa2DC1422E0cE89E1074A6cd7e2481e8e9c4415A6',
      UI_INCENTIVE_DATA_PROVIDER: '0xD01ab9a6577E1D84F142e44D49380e23A340387d',
    },
  },
  [CustomMarket.proto_mumbai]: {
    marketTitle: 'market',
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
      UI_POOL_DATA_PROVIDER: '0x9842E5B7b7C6cEDfB1952a388e050582Ff95645b',
      UI_INCENTIVE_DATA_PROVIDER: '0x070a7D8F4d7A7A87452C5BaBaB3158e08411907E',
    },
  },
  [CustomMarket.proto_matic]: {
    marketTitle: 'market',
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
      UI_POOL_DATA_PROVIDER: '0x3caf35EBd0F8a96fC4b121359bf32F36D68C6ee7',
      UI_INCENTIVE_DATA_PROVIDER: '0x645654D59A5226CBab969b1f5431aA47CBf64ab8',
    },
  },
  [CustomMarket.proto_fuji]: {
    marketTitle: 'market',
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
      UI_POOL_DATA_PROVIDER: '0x93cc892330DFc071e87679468FeE054Cb05074ec',
      UI_INCENTIVE_DATA_PROVIDER: '0x9842E5B7b7C6cEDfB1952a388e050582Ff95645b',
    },
  },
  [CustomMarket.proto_avalanche]: {
    marketTitle: 'market',
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
      UI_POOL_DATA_PROVIDER: '0x64140FE5726d90Aa4f2bD2462522B21E3A7C5775',
      UI_INCENTIVE_DATA_PROVIDER: '0x11979886A6dBAE27D7a72c49fCF3F23240D647bF',
    },
  },
  [CustomMarket.proto_arbitrum_rinkeby]: {
    marketTitle: 'V3 market',
    v3: true,
    chainId: ChainId.arbitrum_rinkeby,
    aTokenPrefix: 'AA',
    enabledFeatures: {
      faucet: true,
      incentives: false,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x3C8364a68063f1819422401d51684A1b0d9ff273'.toLowerCase(),
      LENDING_POOL: '0x78A79d7aaCFb65971ce620341ed5b1f3Ee4AAF29',
      WETH_GATEWAY: '0x54726c2d62C3964734A2e079745c5046406086AA',
      FAUCET: '0x1429C3d60d4387abf84F3EB6aE304783fF5D0f6A',
      WALLET_BALANCE_PROVIDER: '0xE99A60A76749FC744Df6Be6A148CBe25AC400Fb9',
      UI_POOL_DATA_PROVIDER: '0x89E7684C2C4B2FD3d0e06b959503A7739Abd2b88',
      UI_INCENTIVE_DATA_PROVIDER: '0xC058eeAa9C8486213CfACF62a5FdEaddCCa5d87f',
    },
  },
  [CustomMarket.proto_fuji_v3]: {
    marketTitle: 'V3 market',
    v3: true,
    chainId: ChainId.fuji,
    aTokenPrefix: 'AAVA',
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x6c229a4A53e1D4F7849085d0e9F2AcFB3CF6C753'.toLowerCase(),
      LENDING_POOL: '0x3D34dBD730d94E80ed60Df9e02248c15f46F0dA9',
      WETH_GATEWAY: '0x1B8b1ce23E56ADe3F94de58df007fc2C856f870A',
      FAUCET: '0x75723b0F8AbfB0cfC92B7a19C7DbB3D65b8c6650',
      WALLET_BALANCE_PROVIDER: '0x829e32e07be8046581d5D4177d4d62B33298d6B7',
      UI_POOL_DATA_PROVIDER: '0x0a6d13D93E92dEc5DF2283714A99ED6374b7A6DC',
      UI_INCENTIVE_DATA_PROVIDER: '0x0a33601F4d2ae65867c46b87151425cE8314Fb66',
    },
  },
  [CustomMarket.proto_harmony_testnet]: {
    marketTitle: 'V3 market',
    v3: true,
    chainId: ChainId.harmony_testnet,
    aTokenPrefix: 'AAVA',
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x3f69429eEBF14A5D2c8f3DAD74575d3eF3CA7f86'.toLowerCase(),
      LENDING_POOL: '0x43686723d33dD7Bf23d41B1daf4FfC9c87f96c24',
      WETH_GATEWAY: '0x16639024431B63E86BB3e2363c4c574650ea2FDd',
      FAUCET: '0xf76DF90E594a205d95E6F1Ff90EAeCFdc9b7858a',
      WALLET_BALANCE_PROVIDER: '0x1D21707DD3058639e60f96ab4e02fCe7E86c94C3',
      UI_POOL_DATA_PROVIDER: '0x33769D9b3C924C2EA01a0003cD7751A31F7fF33D',
      UI_INCENTIVE_DATA_PROVIDER: '0xF50A16Ee0bd7E4e9a4c383BA0871e4738aC62d36',
    },
  },
  [CustomMarket.proto_fantom_testnet]: {
    marketTitle: 'V3 market',
    v3: true,
    chainId: ChainId.fantom_testnet,
    aTokenPrefix: 'AAVA',
    enabledFeatures: {
      faucet: true,
      incentives: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0x1B23D89352DF0a3808027a7D947170716BBED611'.toLowerCase(),
      LENDING_POOL: '0x9f7CA5f62C8a0Fe1F3F3f31B5927e0006089E903',
      WETH_GATEWAY: '0x2ebbe44ec8101FD3572B99e68e149a5BA9273EE9',
      FAUCET: '0x0Aee74d5eB3629Ac2D621c228C763627DC9682c7',
      WALLET_BALANCE_PROVIDER: '0x58d73EC52845da7824D7D9b24a1Cc4aA2d3b9aAE',
      UI_POOL_DATA_PROVIDER: '0x851F44e30C469b9E4Bf9591309611c28eAb85fAb',
      UI_INCENTIVE_DATA_PROVIDER: '0x2A15b87783b9d590a6c528E7b1Df71ee73540F5A',
    },
  },
  // [CustomMarket.proto_optimism_kovan]: {
  // v3: true,
  // marketTitle: 'V3 market',
  //   chainId: ChainId.optimism_kovan,
  //   logo: logos.aaveLogo,
  //   activeLogo: logos.aaveActiveLogo,
  //   subLogo: logos.avalanche,
  //   aTokenPrefix: 'AAVA',
  //   enabledFeatures: {
  //     faucet: true,
  //     incentives: true,
  //   },
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: ''.toLowerCase(),
  //     LENDING_POOL: '',
  //     WETH_GATEWAY: '',
  //     FAUCET: '',
  //     WALLET_BALANCE_PROVIDER: '',
  //     UI_POOL_DATA_PROVIDER: '',
  //     UI_INCENTIVE_DATA_PROVIDER: '',
  //   },
  // },
} as const;
