export enum AssetCategory {
  ALL = 'all',
  STABLECOINS = 'stablecoins',
  ETH_CORRELATED = 'eth_correlated',
}

export const STABLECOINS_SYMBOLS = [
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
  'MATICX',
  'STMATIC',
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
