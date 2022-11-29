import { formatReservesAndIncentives, formatUserSummaryAndIncentives } from '@aave/math-utils';
import { EmodeCategory } from 'src/helpers/types';
import { fetchIconSymbolAndName, STABLE_ASSETS } from 'src/ui-config/reservePatches';

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

export const reserveSortFn = (a: { iconSymbol: string }, b: { iconSymbol: string }) => {
  const aIsStable = STABLE_ASSETS.includes(a.iconSymbol.toUpperCase());
  const bIsStable = STABLE_ASSETS.includes(b.iconSymbol.toUpperCase());
  if (aIsStable && !bIsStable) return -1;
  if (!aIsStable && bIsStable) return 1;
  return a.iconSymbol.toUpperCase() > b.iconSymbol.toUpperCase() ? 1 : -1;
};

// TODO move formatUserSummaryAndIncentives
// export const selectSortedCurrentUserReservesData = (state: RootStore) => {};

export const selectFormattedReserves = (state: RootStore, currentTimestamp: number) => {
  const reserves = selectCurrentReserves(state);
  const baseCurrencyData = selectCurrentBaseCurrencyData(state);
  const currentNetworkConfig = state.currentNetworkConfig;

  const formattedPoolReserves = formatReservesAndIncentives({
    reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives: state.reserveIncentiveData || [],
  })
    .map((r) => ({
      ...r,
      ...fetchIconSymbolAndName(r),
      isEmodeEnabled: r.eModeCategoryId !== 0,
      isWrappedBaseAsset:
        r.symbol.toLowerCase() === currentNetworkConfig.wrappedBaseAssetSymbol?.toLowerCase(),
    }))
    .sort(reserveSortFn);

  return formattedPoolReserves;
};

export const selectUserSummaryAndIncentives = (state: RootStore, currentTimestamp: number) => {
  const baseCurrencyData = selectCurrentBaseCurrencyData(state);
  const userReserves = selectCurrentUserReserves(state);
  const formattedPoolReserves = selectFormattedReserves(state, currentTimestamp);
  const userEmodeCategoryId = selectCurrentUserEmodeCategoryId(state);
  const reserveIncentiveData = state.reserveIncentiveData;
  const userIncentiveData = state.userIncentiveData;

  // TODO: why <any>
  return formatUserSummaryAndIncentives({
    currentTimestamp,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves,
    formattedReserves: formattedPoolReserves,
    userEmodeCategoryId: userEmodeCategoryId,
    reserveIncentives: reserveIncentiveData || [],
    userIncentives: userIncentiveData || [],
  });
};

export const selectUserNonEmtpySummaryAndIncentive = (
  state: RootStore,
  currentTimestamp: number
) => {
  const user = selectUserSummaryAndIncentives(state, currentTimestamp);
  const userReservesData = user.userReservesData.filter(
    (userReserve) => userReserve.underlyingBalance !== '0'
  );
  return {
    ...user,
    userReservesData,
  };
};

export const selectUserBorrowPositions = (state: RootStore, currentTimestamp: number) => {
  const user = selectUserSummaryAndIncentives(state, currentTimestamp);
  const borrowedPositions = user.userReservesData.filter(
    (reserve) => reserve.variableBorrows != '0' || reserve.stableBorrows != '0'
  );
  return borrowedPositions;
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
