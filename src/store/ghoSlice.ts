import { GhoService } from '@aave/contract-helpers';
import { GhoReserveData, GhoUserData, normalize } from '@aave/math-utils';
import { GHO_SUPPORTED_MARKETS } from 'src/utils/ghoUtilities';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

interface GhoMarketConfig {
  ghoTokenAddress: string;
  uiGhoDataProviderAddress: string;
}

export interface GhoSlice {
  ghoReserveData: GhoReserveData;
  ghoUserData: GhoUserData;
  ghoReserveDataFetched: boolean;
  ghoUserDataFetched: boolean;
  ghoUserQualifiesForDiscount: (futureBorrowAmount?: string) => boolean;
  ghoMarketConfig: () => GhoMarketConfig | undefined;
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
    ghoUserQualifiesForDiscount: (futureBorrowAmount = '0') => {
      const ghoReserveDataFetched = get().ghoReserveDataFetched;
      const ghoUserDataFetched = get().ghoUserDataFetched;

      if (!ghoReserveDataFetched || !ghoUserDataFetched) return false;

      const ghoReserveData = get().ghoReserveData;
      const ghoUserData = get().ghoUserData;

      const borrowBalance = Number(normalize(ghoUserData.userGhoScaledBorrowBalance, 18));
      const minBorrowBalanceForDiscount = Number(
        normalize(ghoReserveData.ghoMinDebtTokenBalanceForDiscount, 18)
      );

      const stkAaveBalance = Number(normalize(ghoUserData.userDiscountTokenBalance, 18));
      const minStkAaveBalanceForDiscount = Number(
        normalize(ghoReserveData.ghoMinDiscountTokenBalanceForDiscount, 18)
      );

      return (
        borrowBalance + Number(futureBorrowAmount) >= minBorrowBalanceForDiscount &&
        stkAaveBalance >= minStkAaveBalanceForDiscount
      );
    },
    ghoMarketConfig: () => {
      const market = get().currentMarket;
      if (!GHO_SUPPORTED_MARKETS.includes(market)) {
        return undefined;
      }

      const { GHO_TOKEN_ADDRESS: ghoTokenAddress, GHO_UI_DATA_PROVIDER: uiGhoDataProviderAddress } =
        get().currentMarketData.addresses;
      if (!ghoTokenAddress || !uiGhoDataProviderAddress) {
        return undefined;
      }

      return {
        ghoTokenAddress,
        uiGhoDataProviderAddress,
      };
    },
    refreshGhoData: async () => {
      const ghoConfig = get().ghoMarketConfig();
      if (!ghoConfig) return;

      const account = get().account;

      const ghoService = new GhoService({
        provider: getProvider(get().currentMarketData.chainId),
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
