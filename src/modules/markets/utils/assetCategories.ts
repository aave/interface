export enum AssetCategory {
  ALL = 'all',
  STABLECOINS = 'stablecoins',
  ETH_CORRELATED = 'eth_correlated',
}

function normalizeStableSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/\.E$/, '')
    .replace(/^M\./, '')
    .replace(/^W/, '')
    .replace(/USD₮0/g, 'USDT')
    .replace(/USD₮/g, 'USDT');
}
function normalizeEthCorrelatedSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/\.E$/, '')
    .replace(/WRSETH/g, 'RSETH');
}

export const categorizeAssetDynamic = (
  symbol: string,
  stablecoinCoinGeckoSymbols: string[],
  ethCorrelatedCoinGeckoSymbols: string[]
): AssetCategory[] => {
  const categories: AssetCategory[] = [AssetCategory.ALL];

  const upperSymbol = symbol.toUpperCase();
  const normalizedStablecoinSymbol = normalizeStableSymbol(upperSymbol);
  if (stablecoinCoinGeckoSymbols.includes(normalizedStablecoinSymbol)) {
    categories.push(AssetCategory.STABLECOINS);
  }
  const normalizedEthCorrelatedSymbol = normalizeEthCorrelatedSymbol(upperSymbol);
  if (ethCorrelatedCoinGeckoSymbols.includes(normalizedEthCorrelatedSymbol)) {
    categories.push(AssetCategory.ETH_CORRELATED);
  }

  return categories;
};

export const isAssetInCategoryDynamic = (
  symbol: string,
  category: AssetCategory,
  stablecoinCoinGeckoSymbols: string[],
  ethCorrelatedCoinGeckoSymbols: string[]
): boolean => {
  if (category === AssetCategory.ALL) {
    return true;
  }
  return categorizeAssetDynamic(
    symbol,
    stablecoinCoinGeckoSymbols,
    ethCorrelatedCoinGeckoSymbols
  ).includes(category);
};
