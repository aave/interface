import { GhoReserveData, GhoUserData, normalize } from '@aave/math-utils';
import { GHO_SUPPORTED_MARKETS } from 'src/utils/ghoUtilities';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

interface GhoMarketConfig {
  ghoTokenAddress: string;
  uiGhoDataProviderAddress: string;
}

interface GhoUtilMintingAvailableParams {
  symbol: string;
  currentMarket: string;
}

export interface GhoSlice {
  ghoReserveData: GhoReserveData;
  ghoUserData: GhoUserData;
  ghoReserveDataFetched: boolean;
  ghoUserDataFetched: boolean;
  ghoUserQualifiesForDiscount: (futureBorrowAmount?: string) => boolean;
  ghoMarketConfig: () => GhoMarketConfig | undefined;
  displayGho: ({ symbol, currentMarket }: GhoUtilMintingAvailableParams) => boolean;
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
    displayGho: ({ symbol, currentMarket }: GhoUtilMintingAvailableParams): boolean => {
      return symbol === 'GHO' && GHO_SUPPORTED_MARKETS.includes(currentMarket);
    },
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
  };
};
