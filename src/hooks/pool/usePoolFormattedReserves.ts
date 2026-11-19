import {
  EmodeDataHumanized,
  ReserveDataHumanized,
  ReservesDataHumanized,
  ReservesIncentiveDataHumanized,
} from '@aave/contract-helpers';
import { formatReservesAndIncentives } from '@aave/math-utils';
import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import {
  CapScenario,
  marketHasDynamicCaps,
  useCapScenario,
  withSimulatedDynamicCaps,
} from 'src/modules/dynamic-caps/simulatedCaps';
import { reserveSortFn } from 'src/store/poolSelectors';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { fetchIconSymbolAndName, IconMapInterface } from 'src/ui-config/reservePatches';
import { getNetworkConfig, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { selectBaseCurrencyData, selectReserves } from './selectors';
import { usePoolsEModes } from './usePoolEModes';
import { usePoolsReservesHumanized } from './usePoolReserves';
import { usePoolsReservesIncentivesHumanized } from './usePoolReservesIncentives';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

export type FormattedReservesAndIncentives = ReturnType<
  typeof formatReservesAndIncentives
>[number] &
  IconMapInterface & {
    isWrappedBaseAsset: boolean;
    /**
     * Set when the reserve's borrow cap is dynamic. `borrowCap` is then the current cap, which moves
     * with borrowing, and `maxCap` is the ceiling it can rise to (token units).
     */
    dynamicBorrowCap?: { maxCap: string };
  } & ReserveDataHumanized;

const formatReserves = memoize(
  (
    reservesData: ReservesDataHumanized,
    incentivesData: ReservesIncentiveDataHumanized[],
    poolsEModesData: EmodeDataHumanized[],
    networkConfig: NetworkConfig
  ) => {
    const reserves = selectReserves(reservesData);
    const baseCurrencyData = selectBaseCurrencyData(reservesData);
    return formatReservesAndIncentives({
      reserves,
      currentTimestamp: dayjs().unix(),
      marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      reserveIncentives: incentivesData,
      eModes: poolsEModesData,
    })
      .map((r) => ({
        ...r,
        ...fetchIconSymbolAndName(r),
        isWrappedBaseAsset:
          r.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase(),
      }))
      .sort(reserveSortFn);
  }
);

// PREVIEW ONLY: dynamic caps are simulated until the contracts are deployed (see simulatedCaps.ts).
const applySimulatedDynamicCaps = memoize(
  (reserves: FormattedReservesAndIncentives[], market: string, scenario: CapScenario) =>
    withSimulatedDynamicCaps(reserves, market, scenario)
);

export const usePoolsFormattedReserves = (
  marketsData: MarketDataType[]
): SimplifiedUseQueryResult<FormattedReservesAndIncentives[]>[] => {
  const [capScenario] = useCapScenario();
  const poolsReservesQueries = usePoolsReservesHumanized(marketsData);
  const poolsReservesIncentivesQueries = usePoolsReservesIncentivesHumanized(marketsData);
  const poolsEModesQueries = usePoolsEModes(marketsData);

  return poolsReservesQueries.map((poolReservesQuery, index) => {
    const marketData = marketsData[index];
    const poolReservesIncentivesQuery = poolsReservesIncentivesQueries[index];
    const poolEModesQuery = poolsEModesQueries[index];
    const networkConfig = getNetworkConfig(marketData.chainId);
    const selector = (
      reservesData: ReservesDataHumanized,
      incentivesData: ReservesIncentiveDataHumanized[],
      poolsEModesData: EmodeDataHumanized[]
    ) => {
      const reserves: FormattedReservesAndIncentives[] = formatReserves(
        reservesData,
        incentivesData,
        poolsEModesData,
        networkConfig
      );
      return marketHasDynamicCaps(marketData.market)
        ? applySimulatedDynamicCaps(reserves, marketData.market, capScenario)
        : reserves;
    };
    return combineQueries(
      [poolReservesQuery, poolReservesIncentivesQuery, poolEModesQuery] as const,
      selector
    );
  });
};

export const usePoolFormattedReserves = (marketData: MarketDataType) => {
  return usePoolsFormattedReserves([marketData])[0];
};
