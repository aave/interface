export enum AssetCategory {
  ALL = 'all',
  STABLECOINS = 'stablecoins',
  ETH_CORRELATED = 'eth_correlated',
  PTS = 'pts',
}

function normalizeStableSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/\.E$/, '')
    .replace(/^M\./, '')
    .replace(/^W/, '')
    .replace(/USD₮0/g, 'USDT')
    .replace(/USD₮/g, 'USDT')
    .replace(/USDT0/g, 'USDT');
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
  if (upperSymbol.startsWith('PT')) {
    categories.push(AssetCategory.PTS);
  }
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

  if (category === AssetCategory.PTS) {
    return symbol.toUpperCase().startsWith('PT');
  }
  return categorizeAssetDynamic(
    symbol,
    stablecoinCoinGeckoSymbols,
    ethCorrelatedCoinGeckoSymbols
  ).includes(category);
};

// Category-filter predicate shared by the market / dashboard / staking asset lists: an asset matches
// when nothing is selected (show all) or it falls into at least one selected category.
export const matchesSelectedCategories = (
  symbol: string,
  selectedCategories: AssetCategory[],
  stablecoinCoinGeckoSymbols: string[] = [],
  ethCorrelatedCoinGeckoSymbols: string[] = []
): boolean =>
  selectedCategories.length === 0 ||
  selectedCategories.some((category) =>
    isAssetInCategoryDynamic(
      symbol,
      category,
      stablecoinCoinGeckoSymbols,
      ethCorrelatedCoinGeckoSymbols
    )
  );
