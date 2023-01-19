import { GhoService } from '@aave/contract-helpers';
import { GhoReserveData, GhoUserData } from '@aave/math-utils';
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

const goerliGhoConfig: GhoMarketConfig = {
  market: marketsData[CustomMarket.proto_goerli_gho_v3],
  ghoTokenAddress: '0x52aD6AE8445cc415fff00b9Af5594B292045867f'.toLowerCase(),
  uiGhoDataProviderAddress: '0x6098d4c9505f9a08b3ae65416b16437119b5faba'.toLowerCase(),
};

// TODO: update when GHO is launched on mainnet
// NOTE: these addresses are Goerli addresses, and should be updated on launch
const mainnetGhoConfig: GhoMarketConfig = {
  market: marketsData[CustomMarket.proto_mainnet],
  ghoTokenAddress: '0x52aD6AE8445cc415fff00b9Af5594B292045867f'.toLowerCase(),
  uiGhoDataProviderAddress: '0x6098d4c9505f9a08b3ae65416b16437119b5faba'.toLowerCase(),
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
      return STAGING_ENV || ENABLE_TESTNET ? goerliGhoConfig : mainnetGhoConfig;
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
