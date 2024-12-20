import { useEffect, useState } from 'react';
import { INDEX_CURRENT } from 'src/modules/markets/index-current-query';
import { INDEX_HISTORY } from 'src/modules/markets/index-history-query';

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
  selectedTimeRange: string
) => {
  const [historicalAPYData, setHistoricalAPYData] = useState<Record<string, Rates>>({});

  useEffect(() => {
    const fetchHistoricalAPYData = async () => {
      if (selectedTimeRange === 'Now') {
        setHistoricalAPYData({});
        return;
      }

      const timeRangeSecondsMap: Record<string, number | undefined> = {
        '30D': 30 * 24 * 60 * 60,
        '60D': 60 * 24 * 60 * 60,
        '90D': 90 * 24 * 60 * 60,
      };

      const timeRangeDaysMap: Record<string, number | undefined> = {
        '30D': 30,
        '60D': 60,
        '90D': 90,
      };

      const timeRangeInSeconds = timeRangeSecondsMap[selectedTimeRange];

      if (timeRangeInSeconds === undefined) {
        console.error(`Invalid time range: ${selectedTimeRange}`);
        setHistoricalAPYData({});
        return;
      }

      const timestamp = Math.floor(Date.now() / 1000) - timeRangeInSeconds;

      try {
        const requestBody = {
          query: INDEX_HISTORY,
          variables: { timestamp },
        };
        const response = await fetch(subgraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const requestBodyCurrent = {
          query: INDEX_CURRENT,
        };
        const responseCurrent = await fetch(subgraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBodyCurrent),
        });

        if (!response.ok || !responseCurrent.ok) {
          throw new Error(`Network error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const dataCurrent = await responseCurrent.json();

        const historyByAsset: Record<string, HistoricalAPYData> = {};
        const currentByAsset: Record<string, HistoricalAPYData> = {};

        data.data.reserveParamsHistoryItems.forEach((entry: any) => {
          const assetKey = entry.reserve.underlyingAsset.toLowerCase();
          if (!historyByAsset[assetKey]) {
            historyByAsset[assetKey] = {
              underlyingAsset: assetKey,
              liquidityIndex: entry.liquidityIndex,
              variableBorrowIndex: entry.variableBorrowIndex,
              liquidityRate: entry.liquidityRate,
              variableBorrowRate: entry.variableBorrowRate,
              timestamp: entry.timestamp,
            };
          }
        });

        dataCurrent.data.reserveParamsHistoryItems.forEach((entry: any) => {
          const assetKey = entry.reserve.underlyingAsset.toLowerCase();
          if (!currentByAsset[assetKey]) {
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

        const allAssets = new Set([
          ...Object.keys(historyByAsset),
          ...Object.keys(currentByAsset),
        ]);

        const results: Record<string, Rates> = {};
        allAssets.forEach((asset) => {
          const historical = historyByAsset[asset];
          const current = currentByAsset[asset];

          if (historical && current) {
            results[asset] = {
              supplyAPY: calculateImpliedAPY(Number(current.liquidityIndex), Number(historical.liquidityIndex), timeRangeDaysMap[selectedTimeRange] || 0),
              variableBorrowAPY: calculateImpliedAPY(Number(current.variableBorrowIndex), Number(historical.variableBorrowIndex), timeRangeDaysMap[selectedTimeRange] || 0),
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
  }, [selectedTimeRange]);

  return historicalAPYData;
};
