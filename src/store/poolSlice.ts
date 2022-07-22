import {
  ReservesDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { StateCreator } from 'zustand';
import { RootStore } from './root';

// TODO: add chain/provider/account mapping
export interface PoolSlice {
  reserves?: ReservesDataHumanized;
  userReserves?: UserReserveDataHumanized[];
  userEmodeCategoryId?: number;
  refreshPoolData: () => Promise<void>;
}

export const createPoolSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  PoolSlice
> = (set, get) => ({
  refreshPoolData: async () => {
    const account = get().account;
    const currentMarketData = get().currentMarketData;
    const currentChainId = get().currentChainId;
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: currentMarketData.addresses.UI_POOL_DATA_PROVIDER,
      provider: get().jsonRpcProvider(),
      chainId: currentChainId,
    });
    try {
      const reservesResponse = await poolDataProviderContract.getReservesHumanized({
        lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      });
      set({ reserves: reservesResponse });
    } catch (e) {
      console.log('error fetching reserves');
    }

    if (account) {
      try {
        const userReservesResponse = await poolDataProviderContract.getUserReservesHumanized({
          lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
          user: account,
        });
        set({
          userEmodeCategoryId: userReservesResponse.userEmodeCategoryId,
          userReserves: userReservesResponse.userReserves,
        });
      } catch (e) {
        console.log('error fetching user-reserves');
      }
    }
  },
});
