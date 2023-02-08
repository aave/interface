import { ReserveDataHumanized } from '@aave/contract-helpers';
import { formatReservesAndIncentives, formatUserSummaryAndIncentives } from '@aave/math-utils';
import { EmodeCategory } from 'src/helpers/types';
import { fetchIconSymbolAndName, STABLE_ASSETS } from 'src/ui-config/reservePatches';
import { CustomMarket, marketsData } from 'src/utils/marketsAndNetworksConfig';

import { PoolReserve } from './poolSlice';
import { RootStore } from './root';

export const selectCurrentChainIdMarkets = (state: RootStore) => {
  const marketNames = Object.keys(marketsData);
  return Object.values(marketsData)
    .map((marketData, index) => ({
      ...marketData,
      marketName: marketNames[index] as CustomMarket,
    }))
    .filter(
      (marketData) =>
        marketData.chainId == state.currentChainId &&
        state.currentNetworkConfig.isFork == marketData.isFork
    );
};

export const selectCurrentChainIdV2MarketData = (state: RootStore) => {
  const currentChainIdMarkets = selectCurrentChainIdMarkets(state);
  const marketData = currentChainIdMarkets.filter((marketData) => !marketData.v3);
  return marketData[0];
};

export const selectCurrentChainIdV3MarketData = (state: RootStore) => {
  const currentChainIdMarkets = selectCurrentChainIdMarkets(state);
  const marketData = currentChainIdMarkets.filter((marketData) => marketData.v3);
  return marketData[0];
};

export const selectCurrentChainIdV2PoolReserve = (state: RootStore) => {
  const marketData = selectCurrentChainIdV2MarketData(state);
  const v2MarketAddressProvider = marketData
    ? marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
    : undefined;
  const currentChainId = state.currentChainId;
  if (v2MarketAddressProvider && currentChainId) {
    return state.data.get(state.currentChainId)?.get(v2MarketAddressProvider);
  }
  return undefined;
};

export const selectCurrentChainIdV3PoolReserve = (state: RootStore) => {
  const marketData = selectCurrentChainIdV3MarketData(state);
  const v3MarketAddressProvider = marketData
    ? marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
    : undefined;
  const currentChainId = state.currentChainId;
  if (v3MarketAddressProvider && currentChainId) {
    return state.data.get(state.currentChainId)?.get(v3MarketAddressProvider);
  }
  return undefined;
};

export const selectCurrentUserLendingPoolData = (state: RootStore) => {
  const marketAddressProvider = state.currentMarketData
    ? state.currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
    : undefined;
  const currentChainId = state.currentChainId;
  if (marketAddressProvider && currentChainId) {
    return state.data.get(state.currentChainId)?.get(marketAddressProvider);
  }
  return undefined;
};

export const selectFormatUserEmodeCategoryId = (reserve?: PoolReserve) => {
  return reserve?.userEmodeCategoryId || 0;
};

export const selectCurrentUserEmodeCategoryId = (state: RootStore): number => {
  return selectFormatUserEmodeCategoryId(selectCurrentUserLendingPoolData(state));
};

export const selectFormatUserReserves = (reserve?: PoolReserve) => {
  return reserve?.userReserves || [];
};

export const selectCurrentUserReserves = (state: RootStore) => {
  return selectFormatUserReserves(selectCurrentUserLendingPoolData(state));
};

export const selectFormatReserves = (reserve?: PoolReserve) => {
  return reserve?.reserves || [];
};

export const selectCurrentReserves = (state: RootStore) => {
  return selectFormatReserves(selectCurrentUserLendingPoolData(state));
};

export const selectFormatBaseCurrencyData = (reserve?: PoolReserve) => {
  return (
    reserve?.baseCurrencyData || {
      marketReferenceCurrencyDecimals: 0,
      marketReferenceCurrencyPriceInUsd: '0',
      networkBaseTokenPriceInUsd: '0',
      networkBaseTokenPriceDecimals: 0,
    }
  );
};

export const selectCurrentBaseCurrencyData = (state: RootStore) => {
  return selectFormatBaseCurrencyData(selectCurrentUserLendingPoolData(state));
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

export const selectNonEmptyUserBorrowPositions = (state: RootStore, currentTimestamp: number) => {
  const user = selectUserSummaryAndIncentives(state, currentTimestamp);
  const borrowedPositions = user.userReservesData.filter(
    (reserve) => reserve.variableBorrows != '0' || reserve.stableBorrows != '0'
  );
  return borrowedPositions;
};

export const formatEmodes = (reserves: ReserveDataHumanized[]) => {
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

export const selectEmodes = (state: RootStore) => {
  const reserves = selectCurrentReserves(state);
  return formatEmodes(reserves);
};

export const selectEmodesV3 = (state: RootStore) => {
  const reserves = selectFormatReserves(selectCurrentChainIdV3PoolReserve(state));
  return formatEmodes(reserves);
};
