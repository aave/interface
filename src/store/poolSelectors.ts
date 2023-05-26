import {
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  ReservesIncentiveDataHumanized,
  UserReserveDataHumanized,
  UserReservesIncentivesDataHumanized,
} from '@aave/contract-helpers';
import {
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives as _formatUserSummaryAndIncentives,
} from '@aave/math-utils';
import { EmodeCategory } from 'src/helpers/types';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { fetchIconSymbolAndName, STABLE_ASSETS } from 'src/ui-config/reservePatches';
import { CustomMarket, marketsData, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';

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

export const reserveSortFn = (a: { iconSymbol: string }, b: { iconSymbol: string }) => {
  const aIsStable = STABLE_ASSETS.includes(a.iconSymbol.toUpperCase());
  const bIsStable = STABLE_ASSETS.includes(b.iconSymbol.toUpperCase());
  if (aIsStable && !bIsStable) return -1;
  if (!aIsStable && bIsStable) return 1;
  return a.iconSymbol.toUpperCase() > b.iconSymbol.toUpperCase() ? 1 : -1;
};

// TODO move formatUserSummaryAndIncentives
// export const selectSortedCurrentUserReservesData = (state: RootStore) => {};

export const formatReserves = (
  reserves: ReserveDataHumanized[],
  baseCurrencyData: PoolBaseCurrencyHumanized,
  currentNetworkConfig: NetworkConfig,
  currentTimestamp: number,
  reserveIncentiveData: ReservesIncentiveDataHumanized[]
): ComputedReserveData[] => {
  const formattedPoolReserves = formatReservesAndIncentives({
    reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives: reserveIncentiveData,
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

export const formatUserSummaryAndIncentives = (
  currentTimestamp: number,
  baseCurrencyData: PoolBaseCurrencyHumanized,
  userReserves: UserReserveDataHumanized[],
  formattedPoolReserves: ComputedReserveData[],
  userIncentiveData: UserReservesIncentivesDataHumanized[],
  userEmodeCategoryId: number,
  reserveIncentiveData: ReservesIncentiveDataHumanized[]
) => {
  // TODO: why <any>
  return _formatUserSummaryAndIncentives({
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
