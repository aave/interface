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
    ghoTokenAddress: '0x52aD6AE8445cc415fff00b9Af5594B292045867f'.toLowerCase(),
    uiGhoDataProviderAddress: '0x6098d4c9505f9a08b3ae65416b16437119b5faba'.toLowerCase(),
  };
};

// TODO: update when GHO is launched on mainnet
// NOTE: these addresses are Goerli addresses, and should be updated on launch
const getMainnetGhoConfig = (market: CustomMarket): GhoMarketConfig => {
  return {
    market: marketsData[market],
    ghoTokenAddress: '0x52aD6AE8445cc415fff00b9Af5594B292045867f'.toLowerCase(),
    uiGhoDataProviderAddress: '0x6098d4c9505f9a08b3ae65416b16437119b5faba'.toLowerCase(),
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
      ghoDiscountLockPeriod: '0',
      ghoMinDebtTokenBalanceForDiscount: '0',
      ghoMinDiscountTokenBalanceForDiscount: '0',
      ghoReserveLastUpdateTimestamp: '0',
      ghoCurrentBorrowIndex: '0',
      aaveFacilitatorBucketLevel: '0',
      aaveFacilitatorBucketMaxCapacity: '0',
    },
    ghoUserData: {
      userGhoDiscountRate: '0',
      userDiscountTokenBalance: '0',
      userPreviousGhoBorrowIndex: '0',
      userGhoScaledBorrowBalance: '0',
      userDiscountLockPeriodEndTimestamp: '0',
    },
    ghoReserveDataFetched: false,
    ghoUserDataFetched: false,
    ghoMarketConfig: () => {
      const currentMarket = get().currentMarket;
      if (GHO_SUPPORTED_MARKETS.includes(currentMarket)) {
        if (STAGING_ENV || ENABLE_TESTNET) {
          return getGoerliGhoConfig(currentMarket);
        } else {
          return getMainnetGhoConfig(currentMarket);
        }
      } else {
        if (STAGING_ENV || ENABLE_TESTNET) {
          return getGoerliGhoConfig(CustomMarket.proto_goerli_gho_v3);
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
      } else {
        const ghoReserveData = await ghoService.getGhoReserveData();
        set({
          ghoReserveData: ghoReserveData,
          ghoReserveDataFetched: true,
          ghoUserDataFetched: false,
        });
      }
    },
  };
};
