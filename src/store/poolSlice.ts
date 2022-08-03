import {
  FaucetService,
  LendingPool,
  Pool,
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { optimizedPath } from 'src/utils/utils';
import { StateCreator } from 'zustand';
import { produce } from 'immer';
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
  // methods
  mint: FaucetService['mint'];
  withdraw: LendingPool['withdraw'];
}

export const createPoolSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  PoolSlice
> = (set, get) => {
  function getCorrectPool() {
    const currentMarketData = get().currentMarketData;
    const provider = get().jsonRpcProvider();
    if (currentMarketData.v3) {
      return new Pool(provider, {
        POOL: currentMarketData.addresses.LENDING_POOL,
        REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
        SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
        WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
        L2_ENCODER: currentMarketData.addresses.L2_ENCODER,
      });
    } else {
      return new LendingPool(provider, {
        LENDING_POOL: currentMarketData.addresses.LENDING_POOL,
        REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
        SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
        WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
      });
    }
  }
  return {
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
      const promises: Promise<void>[] = [];
      try {
        promises.push(
          poolDataProviderContract
            .getReservesHumanized({
              lendingPoolAddressProvider,
            })
            .then((reservesResponse) =>
              set((state) =>
                produce(state, (draft) => {
                  if (draft.reserves) {
                    draft.reserves[currentChainId][lendingPoolAddressProvider] =
                      reservesResponse.reservesData;
                  }
                  if (draft.baseCurrencyData) {
                    draft.baseCurrencyData[currentChainId][lendingPoolAddressProvider] =
                      reservesResponse.baseCurrencyData;
                  }
                })
              )
            )
        );
        if (account) {
          promises.push(
            poolDataProviderContract
              .getUserReservesHumanized({
                lendingPoolAddressProvider,
                user: account,
              })
              .then((userReservesResponse) =>
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
                }))
              )
          );
        }
        await Promise.all(promises);
      } catch (e) {
        console.log('error fetching pool data');
      }
    },
    mint: (...args) => {
      if (!get().currentMarketData.addresses.FAUCET)
        throw Error('currently selected market does not have a faucet attached');
      const service = new FaucetService(
        get().jsonRpcProvider(),
        get().currentMarketData.addresses.FAUCET
      );
      return service.mint(...args);
    },
    withdraw: (args) => {
      const pool = getCorrectPool();
      return pool.withdraw({ ...args, useOptimizedPath: optimizedPath(get().currentChainId) });
    },
  };
};
