export enum AssetCategory {
  ALL = 'all',
  STABLECOINS = 'stablecoins',
  ETH_CORRELATED = 'eth_correlated',
}

export const STABLECOINS_SYMBOLS = [
  //proto_mainnet_v3
  'USDT',
  'USDC',
  'PT SUSDE SEPTEMBER',
  'PT USDE SEPTEMBER 25TH 2025',
  'USDE',
  'RLUSD',
  'GHO',
  'DAI',
  'USDtb',
  'PT EUSDE AUGUST',
  'USDS',
  'PYUSD',
  'LUSD',
  'EUSDE',
  'FRAX',
  'crvUSD',
  'PT SUSDE JULY',
  'PT EUSDE MAY',
  'PT USDE JULY',
];
export const ETH_CORRELATED_SYMBOLS = [
  //proto_mainnet_v3
  'ETH',
  'WEETH',
  'WSTETH',
  'RSETH',
  'OSETH',
  'RETH',
  'ETHX',
  'CBETH',
];
export const categorizeAsset = (symbol: string): AssetCategory[] => {
  const categories: AssetCategory[] = [AssetCategory.ALL];

  const normalizedSymbol = symbol.toUpperCase();
  if (STABLECOINS_SYMBOLS.includes(normalizedSymbol)) {
    categories.push(AssetCategory.STABLECOINS);
  }

  if (ETH_CORRELATED_SYMBOLS.includes(normalizedSymbol)) {
    categories.push(AssetCategory.ETH_CORRELATED);
  }

  return categories;
};

export const isAssetInCategory = (symbol: string, category: AssetCategory): boolean => {
  if (category === AssetCategory.ALL) {
    return true;
  }
  return categorizeAsset(symbol).includes(category);
};
