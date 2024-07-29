import { ReserveDataHumanized } from '@aave/contract-helpers';
import { EmodeCategory } from 'src/helpers/types';
import { CustomMarket, marketsData, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { PoolReserve } from './poolSlice';

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

  // If all reserves have an eMode cateogry other than 0, we need to add the default empty one.
  // The UI assumes that there is always an eMode category 0, which is 'none'.
  if (!eModes[0]) {
    eModes[0] = {
      liquidationBonus: 0,
      id: 0,
      label: '',
      liquidationThreshold: 0,
      ltv: 0,
      priceSource: '0x0000000000000000000000000000000000000000',
      assets: [],
    };
  }

  return eModes;
};
