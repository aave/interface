import { useEffect, useState } from 'react';
import { constructIndexCurrentQuery } from 'src/modules/markets/index-current-query';
import { constructIndexHistoryQuery } from 'src/modules/markets/index-history-query';
import { generateAliases } from 'src/utils/generateSubgraphQueryAlias';

export interface HistoricalAPYData {
  underlyingAsset: string;
  liquidityIndex: string;
  variableBorrowIndex: string;
  timestamp: string;
  liquidityRate: string;
  variableBorrowRate: string;
}

interface Rates {
  supplyAPY: string;
  variableBorrowAPY: string;
}

function calculateImpliedAPY(
  currentLiquidityIndex: number,
  previousLiquidityIndex: number,
  daysBetweenIndexes: number,
): string {
  if (previousLiquidityIndex <= 0 || currentLiquidityIndex <= 0) {
    throw new Error("Liquidity indexes must be positive values.");
  }

  const growthFactor = currentLiquidityIndex / previousLiquidityIndex;
  const annualizedGrowthFactor = Math.pow(growthFactor, 365 / daysBetweenIndexes);
  const impliedAPY = (annualizedGrowthFactor - 1);

  return impliedAPY.toString();
}

export const useHistoricalAPYData = (
  subgraphUrl: string,
  selectedTimeRange: string,
  underlyingAssets: string[],
) => {
  const [historicalAPYData, setHistoricalAPYData] = useState<Record<string, Rates>>({});

  useEffect(() => {
    const fetchHistoricalAPYData = async () => {
      if (selectedTimeRange === 'Now' || underlyingAssets.length === 0) {
        setHistoricalAPYData({});
        return;
      }

      const timeRangeSecondsMap: Record<string, number | undefined> = {
        '30D': 30 * 24 * 60 * 60,
        '60D': 60 * 24 * 60 * 60,
        '180D': 180 * 24 * 60 * 60,
        '1Y': 365 * 24 * 60 * 60,
      };

      const timeRangeDaysMap: Record<string, number | undefined> = {
        '30D': 30,
        '60D': 60,
        '180D': 180,
        '1Y': 365,
      };

      const timeRangeInSeconds = timeRangeSecondsMap[selectedTimeRange];

      if (timeRangeInSeconds === undefined) {
        console.error(`Invalid time range: ${selectedTimeRange}`);
        setHistoricalAPYData({});
        return;
      }

      const timestamp = Math.floor(Date.now() / 1000) - timeRangeInSeconds;

      try {
        const requestBodyHistory = {
          query: constructIndexHistoryQuery(underlyingAssets),
          variables: { timestamp },
        };
        const responseHistory = await fetch(subgraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBodyHistory),
        });

        const requestBodyCurrent = {
          query: constructIndexCurrentQuery(underlyingAssets),
        };
        const responseCurrent = await fetch(subgraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBodyCurrent),
        });

        if (!responseHistory.ok || !responseCurrent.ok) {
          throw new Error(`Network error: ${responseHistory.status} - ${responseHistory.statusText}`);
        }

        const dataHistory = await responseHistory.json();
        const dataCurrent = await responseCurrent.json();

        const historyByAsset: Record<string, HistoricalAPYData> = {};
        const currentByAsset: Record<string, HistoricalAPYData> = {};

        const aliases = generateAliases(underlyingAssets.length);

        underlyingAssets.forEach((_, index) => {
          const alias = aliases[index];

          const historicalEntry = dataHistory.data[alias];
          if (historicalEntry && historicalEntry.length > 0) {
            const entry = historicalEntry[0];
            const assetKey = entry.reserve.underlyingAsset.toLowerCase();
            historyByAsset[assetKey] = {
              underlyingAsset: assetKey,
              liquidityIndex: entry.liquidityIndex,
              variableBorrowIndex: entry.variableBorrowIndex,
              liquidityRate: entry.liquidityRate,
              variableBorrowRate: entry.variableBorrowRate,
              timestamp: entry.timestamp,
            };
          }

          const currentEntry = dataCurrent.data[alias];
          if (currentEntry && currentEntry.length > 0) {
            const entry = currentEntry[0];
            const assetKey = entry.reserve.underlyingAsset.toLowerCase();
            currentByAsset[assetKey] = {
              underlyingAsset: assetKey,
              liquidityIndex: entry.liquidityIndex,
              variableBorrowIndex: entry.variableBorrowIndex,
              liquidityRate: entry.liquidityRate,
              variableBorrowRate: entry.variableBorrowRate,
              timestamp: entry.timestamp,
            };
          }
        });

        const results: Record<string, Rates> = {};
        underlyingAssets.forEach((asset) => {
          const assetKey = asset.toLowerCase();
          const historical = historyByAsset[assetKey];
          const current = currentByAsset[assetKey];

          if (historical && current) {
            results[assetKey] = {
              supplyAPY: calculateImpliedAPY(
                Number(current.liquidityIndex),
                Number(historical.liquidityIndex),
                timeRangeDaysMap[selectedTimeRange] || 0
              ),
              variableBorrowAPY: calculateImpliedAPY(
                Number(current.variableBorrowIndex),
                Number(historical.variableBorrowIndex),
                timeRangeDaysMap[selectedTimeRange] || 0
              ),
            };
          }
        });

        setHistoricalAPYData(results);
      } catch (error) {
        console.error('Error fetching historical APY data:', error);
        setHistoricalAPYData({});
      }
    };

    fetchHistoricalAPYData();
  }, [selectedTimeRange, underlyingAssets]);

  return historicalAPYData;
};
