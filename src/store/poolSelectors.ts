import { RootStore } from './root';

export const selectCurrentUserLendingPoolData = (state: RootStore) => {
  return state.data
    .get(state.currentChainId)
    ?.get(state.currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER);
};

export const selectCurrentUserEmodeCategoryId = (state: RootStore): number => {
  return selectCurrentUserLendingPoolData(state)?.userEmodeCategoryId || 0;
};

export const selectCurrentUserReserves = (state: RootStore) => {
  return selectCurrentUserLendingPoolData(state)?.userReserves || [];
};

export const selectCurrentReserves = (state: RootStore) => {
  return selectCurrentUserLendingPoolData(state)?.reserves || [];
};

export const selectCurrentBaseCurrencyData = (state: RootStore) => {
  return (
    selectCurrentUserLendingPoolData(state)?.baseCurrencyData || {
      marketReferenceCurrencyDecimals: 0,
      marketReferenceCurrencyPriceInUsd: '0',
      networkBaseTokenPriceInUsd: '0',
      networkBaseTokenPriceDecimals: 0,
    }
  );
};
