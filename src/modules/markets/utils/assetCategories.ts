export enum AssetCategory {
  ALL = 'all',
  STABLECOINS = 'stablecoins',
  ETH_CORRELATED = 'eth_correlated',
}

export const STABLECOINS_SYMBOLS_FALLBACK = [
  //proto_mainnet_v3
  'USDT',
  'USDC',
  'USDE',
  'RLUSD',
  'GHO',
  'DAI',
  'USDTB',
  'USDS',
  'PYUSD',
  'LUSD',
  'EUSDE',
  'FRAX',
  'CRVUSD',
  //proto_primenet_v3
  //proto_base_v3
  'EURC',
  'USDBC',
  //proto_arbitrum_v3
  'USD₮0',
  'USDC.E',
  'MAI',
  'EURS',
  //proto_avalanche_v3
  'AUSD',
  'DAI.E',
  //proto_sonic_v3
  //proto_optimism_v3
  'SUSD',
  //proto_polygon_v3
  'JEUR',
  'MIMATIC',
  'EURA',
  //proto_metis_v3
  'M.USDC',
  'M.USDT',
  'M.DAI',
  //proto_gnosis_v3
  'SDAI',
  'EURE',
  'WXDAI',
  //proto_bnb_v3
  'FDUSD',
  //proto_scroll_v3
  //proto_zksync_v3
  'SUSDE',
  //proto_linea_v3
  //proto_celo_v3
  'USD₮',
  'CUSD',
  'CEUR',
  //proto_soneium_v3
  //proto_etherfi_v3
];
export const ETH_CORRELATED_SYMBOLS_FALLBACK = [
  //proto_mainnet_v3
  'ETH',
  'WEETH',
  'WSTETH',
  'RSETH',
  'OSETH',
  'RETH',
  'ETHX',
  'CBETH',
  //proto_primenet_v3
  'EZETH',
  'WETH',
  'TETH',
  //proto_base_v3
  'WRSETH',
  //proto_arbitrum_v3
  //proto_avalanche_v3
  'WETH.E',
  //proto_sonic_v3
  //proto_optimism_v3
  //proto_polygon_v3
  //proto_metis_v3
  //proto_gnosis_v3
  //proto_bnb_v3
  //proto_scroll_v3
  //proto_zksync_v3
  //proto_linea_v3
  //proto_celo_v3
  //proto_soneium_v3
  //proto_etherfi_v3
];
function normalizeSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/\.E$/, '') // DAI.E → DAI, USDC.E → USDC
    .replace(/^M\./, '') // M.USDC → USDC
    .replace(/^W/, '') // WETH, WBTC → ETH, BTC
    .replace(/USD₮0/g, 'USDT')
    .replace(/USD₮/g, 'USDT');
}

export const categorizeAssetDynamic = (
  symbol: string,
  stablecoinCoinGeckoSymbols: string[],
  ethCorrelatedCoinGeckoSymbols: string[]
): AssetCategory[] => {
  const categories: AssetCategory[] = [AssetCategory.ALL];

  const upperSymbol = symbol.toUpperCase();
  const normalizedStablecoinSymbol = normalizeSymbol(upperSymbol);
  if (stablecoinCoinGeckoSymbols.includes(normalizedStablecoinSymbol)) {
    categories.push(AssetCategory.STABLECOINS);
  }

  if (ethCorrelatedCoinGeckoSymbols.includes(upperSymbol)) {
    categories.push(AssetCategory.ETH_CORRELATED);
  }

  return categories;
};

// Nueva función para verificar categoría dinámicamente
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

// export const categorizeAsset = (symbol: string): AssetCategory[] => {
//   const categories: AssetCategory[] = [AssetCategory.ALL];

//   const normalizedSymbol = symbol.toUpperCase();
//   if (STABLECOINS_SYMBOLS_FALLBACK.includes(normalizedSymbol)) {
//     categories.push(AssetCategory.STABLECOINS);
//   }

//   if (ETH_CORRELATED_SYMBOLS.includes(normalizedSymbol)) {
//     categories.push(AssetCategory.ETH_CORRELATED);
//   }

//   return categories;
// };

// export const isAssetInCategory = (symbol: string, category: AssetCategory): boolean => {
//   if (category === AssetCategory.ALL) {
//     return true;
//   }
//   return categorizeAsset(symbol).includes(category);
// };
