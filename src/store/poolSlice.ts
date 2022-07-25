import {
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { StateCreator } from 'zustand';
import { RootStore } from './root';

// TODO: add chain/provider/account mapping
export interface PoolSlice {
  reserves?: { [chainId: number]: { [address: string]: ReserveDataHumanized[] } };
  baseCurrencyData?: { [chainId: number]: { [address: string]: PoolBaseCurrencyHumanized } };
  userReserves?: { [chainId: number]: { [address: string]: UserReserveDataHumanized[] } };
  userEmodeCategoryId?: { [chainId: number]: { [address: string]: number } };
  refreshPoolData: () => Promise<void>;
  computed: {
    get currentUserReserves(): UserReserveDataHumanized[];
    get currentUserEmodeCategoryId(): number;
    get currentReserves(): ReserveDataHumanized[];
    get currentBaseCurrencyData(): PoolBaseCurrencyHumanized;
  };
}

export const createPoolSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  PoolSlice
> = (set, get) => ({
  computed: {
    get currentUserEmodeCategoryId() {
      return (
        get()?.userEmodeCategoryId?.[get().currentChainId]?.[
          get().currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
        ] || 0
      );
    },
    get currentUserReserves() {
      return (
        get()?.userReserves?.[get().currentChainId]?.[
          get().currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
        ] || []
      );
    },
    get currentReserves() {
      return (
        get()?.reserves?.[get().currentChainId]?.[
          get().currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
        ] || []
      );
    },
    get currentBaseCurrencyData() {
      return (
        get()?.baseCurrencyData?.[get().currentChainId]?.[
          get().currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
        ] || {
          marketReferenceCurrencyDecimals: 0,
          marketReferenceCurrencyPriceInUsd: '0',
          networkBaseTokenPriceInUsd: '0',
          networkBaseTokenPriceDecimals: 0,
        }
      );
    },
  },
  refreshPoolData: async () => {
    const account = get().account;
    const currentMarketData = get().currentMarketData;
    const currentChainId = get().currentChainId;
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: currentMarketData.addresses.UI_POOL_DATA_PROVIDER,
      provider: get().jsonRpcProvider(),
      chainId: currentChainId,
    });
    const lendingPoolAddressProvider = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
    try {
      const reservesResponse = await poolDataProviderContract.getReservesHumanized({
        lendingPoolAddressProvider,
      });
      set((state) => ({
        reserves: {
          ...state.reserves,
          [currentChainId]: {
            ...state.reserves?.[currentChainId],
            [lendingPoolAddressProvider]: reservesResponse.reservesData,
          },
        },
        baseCurrencyData: {
          ...state.baseCurrencyData,
          [currentChainId]: {
            ...state.baseCurrencyData?.[currentChainId],
            [lendingPoolAddressProvider]: reservesResponse.baseCurrencyData,
          },
        },
      }));
    } catch (e) {
      console.log('error fetching reserves');
    }

    if (account) {
      try {
        const userReservesResponse = await poolDataProviderContract.getUserReservesHumanized({
          lendingPoolAddressProvider,
          user: account,
        });
        set((state) => ({
          userReserves: {
            ...state.userReserves,
            [currentChainId]: {
              ...state.userReserves?.[currentChainId],
              [lendingPoolAddressProvider]: userReservesResponse.userReserves,
            },
          },
          userEmodeCategoryId: {
            ...state.userEmodeCategoryId,
            [currentChainId]: {
              ...state.userEmodeCategoryId?.[currentChainId],
              [lendingPoolAddressProvider]: userReservesResponse.userEmodeCategoryId,
            },
          },
        }));
      } catch (e) {
        console.log('error fetching user-reserves');
      }
    }
  },
});
