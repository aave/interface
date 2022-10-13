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
  data: Map<
    number,
    Map<
      string,
      {
        reserves?: ReserveDataHumanized[];
        baseCurrencyData?: PoolBaseCurrencyHumanized;
        userEmodeCategoryId?: number;
        userReserves?: UserReserveDataHumanized[];
      }
    >
  >;
  refreshPoolData: () => Promise<void>;
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
    data: new Map(),
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
                  if (!draft.data.get(currentChainId)) draft.data.set(currentChainId, new Map());
                  if (!draft.data.get(currentChainId)?.get(lendingPoolAddressProvider)) {
                    draft.data.get(currentChainId)!.set(lendingPoolAddressProvider, {
                      reserves: reservesResponse.reservesData,
                      baseCurrencyData: reservesResponse.baseCurrencyData,
                    });
                  } else {
                    draft.data.get(currentChainId)!.get(lendingPoolAddressProvider)!.reserves =
                      reservesResponse.reservesData;
                    draft.data
                      .get(currentChainId)!
                      .get(lendingPoolAddressProvider)!.baseCurrencyData =
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
                set((state) =>
                  produce(state, (draft) => {
                    if (!draft.data.get(currentChainId)) draft.data.set(currentChainId, new Map());
                    if (!draft.data.get(currentChainId)?.get(lendingPoolAddressProvider)) {
                      draft.data.get(currentChainId)!.set(lendingPoolAddressProvider, {
                        userReserves: userReservesResponse.userReserves,
                        userEmodeCategoryId: userReservesResponse.userEmodeCategoryId,
                      });
                    } else {
                      draft.data
                        .get(currentChainId)!
                        .get(lendingPoolAddressProvider)!.userReserves =
                        userReservesResponse.userReserves;
                      draft.data
                        .get(currentChainId)!
                        .get(lendingPoolAddressProvider)!.userEmodeCategoryId =
                        userReservesResponse.userEmodeCategoryId;
                    }
                  })
                )
              )
          );
        }
        await Promise.all(promises);
      } catch (e) {
        console.log('error fetching pool data', e);
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
