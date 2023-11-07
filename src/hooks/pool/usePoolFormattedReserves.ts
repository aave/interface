import { ReservesDataHumanized, ReservesIncentiveDataHumanized } from '@aave/contract-helpers';
import { formatReservesAndIncentives } from '@aave/math-utils';
import { UseQueryResult } from '@tanstack/react-query';
import { createSelector } from 'reselect';
import { reserveSortFn } from 'src/store/poolSelectors';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { getNetworkConfig, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { usePoolsReservesHumanized } from './usePoolReserves';
import { usePoolsReservesIncentivesHumanized } from './usePoolReservesIncentives';

export type ExtractDataType<T extends { data: unknown }[]> = {
  [index in keyof T]: T[index] extends T[number] ? T[index]['data'] : never;
};

export const combineQueries = <Queries extends UseQueryResult<unknown>[], P>(
  queries: Queries,
  combiner: (...queries: Queries) => P
) => {
  const isLoading = queries.some((elem) => elem.status === 'loading');
  const allData = queries.every((elem) => elem.data);
  const error = queries.find((elem) => elem.error)?.error;
  return {
    isLoading: isLoading,
    data: allData ? combiner(...queries) : undefined,
    error,
  };
};

const selectBaseCurrencyData = (poolReserve: ReservesDataHumanized) => poolReserve.baseCurrencyData;
const selectReservesData = (poolReserve: ReservesDataHumanized) => poolReserve.reservesData;

const selectFormattedReserves = createSelector(
  [
    selectReservesData,
    selectBaseCurrencyData,
    (_: ReservesDataHumanized, incentivesData: ReservesIncentiveDataHumanized[]) => incentivesData,
    (
      _: ReservesDataHumanized,
      __: ReservesIncentiveDataHumanized[],
      networkConfig: NetworkConfig
    ) => networkConfig,
  ],
  (reserves, baseCurrencyData, incentivesData, networkConfig) =>
    formatReservesAndIncentives({
      reserves,
      currentTimestamp: 0,
      marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      reserveIncentives: incentivesData,
    })
      .map((r) => ({
        ...r,
        ...fetchIconSymbolAndName(r),
        isEmodeEnabled: r.eModeCategoryId !== 0,
        isWrappedBaseAsset:
          r.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase(),
      }))
      .sort(reserveSortFn)
);

export const usePoolsFormattedReserves = (marketsData: MarketDataType[]) => {
  const poolsReservesQuery = usePoolsReservesHumanized(marketsData);
  const poolsReservesIncentivesQuery = usePoolsReservesIncentivesHumanized(marketsData);

  return poolsReservesQuery.map((elem, index) => {
    const marketData = marketsData[index];
    const networkConfig = getNetworkConfig(marketData.chainId);
    const selector = (
      reservesQuery: UseQueryResult<ReservesDataHumanized>,
      incentivesQuery: UseQueryResult<ReservesIncentiveDataHumanized[]>
    ) => {
      invariant(reservesQuery.data && incentivesQuery.data, '');
      return selectFormattedReserves(reservesQuery.data, incentivesQuery.data, networkConfig);
    };
    const queries: [
      UseQueryResult<ReservesDataHumanized, unknown>,
      UseQueryResult<ReservesIncentiveDataHumanized[], unknown>
    ] = [elem, poolsReservesIncentivesQuery[index]];
    return combineQueries(queries, selector);
  });
};

export const usePoolFormattedReserves = (marketData: MarketDataType) => {
  return usePoolsFormattedReserves([marketData])[0];
};
