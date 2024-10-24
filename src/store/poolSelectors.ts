import { FormattedReservesAndIncentives } from 'src/hooks/pool/usePoolFormattedReserves';
import { CustomMarket, marketsData, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { PoolReserve } from './poolSlice';

// TODO: refactor existing utils type EmodeCategory
export type NewEModeCategory = {
  id: number;
  label: string;
  ltv: string;
  liquidationThreshold: string;
  liquidationBonus: string;
  assets: Array<{
    symbol: string;
    collateral: boolean;
    borrowable: boolean;
  }>;
};

export const selectCurrentChainIdMarkets = (
  chainId: number,
  currentNetworkConfig: NetworkConfig
) => {
  const marketNames = Object.keys(marketsData);
  return Object.values(marketsData)
    .map((marketData, index) => ({
      ...marketData,
      marketName: marketNames[index] as CustomMarket,
    }))
    .filter(
      (marketData) =>
        marketData.chainId == chainId && currentNetworkConfig.isFork == marketData.isFork
    );
};

export const selectCurrentChainIdV3MarketData = (
  chainId: number,
  currentNetworkConfig: NetworkConfig
) => {
  const currentChainIdMarkets = selectCurrentChainIdMarkets(chainId, currentNetworkConfig);
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

export const reserveSortFn = (
  a: { totalLiquidityUSD: string },
  b: { totalLiquidityUSD: string }
) => {
  const numA = parseFloat(a.totalLiquidityUSD);
  const numB = parseFloat(b.totalLiquidityUSD);

  return numB > numA ? 1 : -1;
};

export const formatEmodes = (reserves: FormattedReservesAndIncentives[]) => {
  const eModes: Record<number, NewEModeCategory> = {};

  reserves.forEach((r) => {
    r.eModes.forEach((e) => {
      if (!eModes[e.id]) {
        eModes[e.id] = {
          id: e.id,
          label: e.eMode.label,
          ltv: e.eMode.ltv,
          liquidationThreshold: e.eMode.liquidationThreshold,
          liquidationBonus: e.eMode.liquidationBonus,
          assets: [
            {
              symbol: r.symbol,
              collateral: e.collateralEnabled,
              borrowable: e.borrowingEnabled,
            },
          ],
        };
      } else {
        eModes[e.id].assets.push({
          symbol: r.symbol,
          collateral: e.collateralEnabled,
          borrowable: e.borrowingEnabled,
        });
      }
    });
  });

  // If all reserves have an eMode cateogry other than 0, we need to add the default empty one.
  // The UI assumes that there is always an eMode category 0, which is 'none'.
  if (!eModes[0]) {
    eModes[0] = {
      id: 0,
      label: '',
      liquidationBonus: '0',
      liquidationThreshold: '0',
      ltv: '0',
      assets: [],
    };
  }

  return eModes;
};
