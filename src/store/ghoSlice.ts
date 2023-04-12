import { GhoService } from '@aave/contract-helpers';
import { GhoReserveData, GhoUserData } from '@aave/math-utils';
import { GHO_SUPPORTED_MARKETS } from 'src/utils/ghoUtilities';
import {
  CustomMarket,
  ENABLE_TESTNET,
  getProvider,
  MarketDataType,
  marketsData,
  STAGING_ENV,
} from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

interface GhoMarketConfig {
  market: MarketDataType;
  ghoTokenAddress: string;
  uiGhoDataProviderAddress: string;
}

const getGoerliGhoConfig = (market: CustomMarket): GhoMarketConfig => {
  return {
    market: marketsData[market],
    ghoTokenAddress: '0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211'.toLowerCase(),
    uiGhoDataProviderAddress: '0xe9a16936340097B71370a973363176CA670D666C'.toLowerCase(),
  };
};

const getSepoliGhoConfig = (market: CustomMarket): GhoMarketConfig => {
  return {
    market: marketsData[market],
    ghoTokenAddress: '0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D'.toLowerCase(),
    uiGhoDataProviderAddress: '0xCC3B9A84d5AbC04fb73B2a8Fa67Be4335d55D594'.toLowerCase(),
  };
};

// TODO: update when GHO is launched on mainnet
// NOTE: these addresses are Goerli addresses, and should be updated on launch
const getMainnetGhoConfig = (market: CustomMarket): GhoMarketConfig => {
  return {
    market: marketsData[market],
    ghoTokenAddress: '0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211'.toLowerCase(),
    uiGhoDataProviderAddress: '0xE914D574975a1Cd273388035Db4413dda788c0E5'.toLowerCase(),
  };
};

export interface GhoSlice {
  ghoReserveData: GhoReserveData;
  ghoUserData: GhoUserData;
  ghoReserveDataFetched: boolean;
  ghoUserDataFetched: boolean;
  ghoMarketConfig: () => GhoMarketConfig;
  refreshGhoData: () => Promise<void>;
}

export const createGhoSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  GhoSlice
> = (set, get) => {
  return {
    ghoReserveData: {
      ghoBaseVariableBorrowRate: '0',
      ghoDiscountedPerToken: '0',
      ghoDiscountRate: '0',
      ghoMinDebtTokenBalanceForDiscount: '0',
      ghoMinDiscountTokenBalanceForDiscount: '0',
      ghoReserveLastUpdateTimestamp: '0',
      ghoCurrentBorrowIndex: '0',
      aaveFacilitatorBucketLevel: '0',
      aaveFacilitatorBucketMaxCapacity: '0',
    },
    ghoUserData: {
      userGhoDiscountPercent: '0',
      userDiscountTokenBalance: '0',
      userPreviousGhoBorrowIndex: '0',
      userGhoScaledBorrowBalance: '0',
    },
    ghoReserveDataFetched: false,
    ghoUserDataFetched: false,
    ghoMarketConfig: () => {
      const currentMarket = get().currentMarket;

      if (GHO_SUPPORTED_MARKETS.includes(currentMarket)) {
        if (STAGING_ENV || ENABLE_TESTNET) {
          if (currentMarket.endsWith('proto_sepolia_gho_v3')) {
            return getSepoliGhoConfig(currentMarket);
          } else {
            return getGoerliGhoConfig(currentMarket);
          }
        } else {
          return getMainnetGhoConfig(currentMarket);
        }
      } else {
        if (STAGING_ENV || ENABLE_TESTNET) {
          if (currentMarket === 'proto_sepolia_gho_v3') {
            return getSepoliGhoConfig(CustomMarket.proto_sepolia_gho_v3);
          } else {
            return getGoerliGhoConfig(CustomMarket.proto_goerli_gho_v3);
          }
        } else {
          return getMainnetGhoConfig(CustomMarket.proto_mainnet);
        }
      }
    },
    refreshGhoData: async () => {
      const ghoConfig = get().ghoMarketConfig();
      if (!ghoConfig) return;
      // temporary to prevent app crashes when launching in production mode
      if (!STAGING_ENV || ENABLE_TESTNET) return;

      const account = get().account;

      const ghoService = new GhoService({
        provider: getProvider(ghoConfig.market.chainId),
        uiGhoDataProviderAddress: ghoConfig.uiGhoDataProviderAddress,
      });

      if (account) {
        try {
          const [ghoReserveData, ghoUserData] = await Promise.all([
            ghoService.getGhoReserveData(),
            ghoService.getGhoUserData(account),
          ]);

          set({
            ghoReserveData: ghoReserveData,
            ghoUserData: ghoUserData,
            ghoReserveDataFetched: true,
            ghoUserDataFetched: true,
          });
        } catch (err) {
          console.log('error', err);
        }
      } else {
        try {
          const ghoReserveData = await ghoService.getGhoReserveData();

          set({
            ghoReserveData: ghoReserveData,
            ghoReserveDataFetched: true,
            ghoUserDataFetched: false,
          });
        } catch (err) {
          console.log('error', err);
        }
      }
    },
  };
};
