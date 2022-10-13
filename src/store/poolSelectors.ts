import { EmodeCategory } from 'src/helpers/types';

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

export const selectEmodes = (state: RootStore) => {
  const reserves = selectCurrentReserves(state);

  const eModes = reserves?.reduce((acc, r) => {
    if (!acc[r.eModeCategoryId])
      acc[r.eModeCategoryId] = {
        liquidationBonus: r.eModeLiquidationBonus,
        id: r.eModeCategoryId,
        label: r.eModeLabel,
        liquidationThreshold: r.eModeLiquidationThreshold,
        ltv: r.eModeLtv,
        priceSource: r.eModePriceSource,
        assets: [r.symbol],
      };
    else acc[r.eModeCategoryId].assets.push(r.symbol);
    return acc;
  }, {} as Record<number, EmodeCategory>);

  return eModes;
};
