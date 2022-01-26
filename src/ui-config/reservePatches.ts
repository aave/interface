export const SYMBOL_MAP: { [key: string]: string } = {
  UNIDAIWETH: 'UNI_DAI_WETH',
  UNIWBTCUSDC: 'UNI_WBTC_USDC',
  UNIWBTCWETH: 'UNI_WBTC_WETH',
  UNIAAVEWETH: 'UNI_AAVE_WETH',
  UNIBATWETH: 'UNI_BAT_WETH',
  UNIDAIUSDC: 'UNI_DAI_USDC',
  UNICRVWETH: 'UNI_CRV_WETH',
  UNILINKWETH: 'UNI_LINK_WETH',
  UNIMKRWETH: 'UNI_MKR_WETH',
  UNIRENWETH: 'UNI_REN_WETH',
  UNISNXWETH: 'UNI_SNX_WETH',
  UNIUNIWETH: 'UNI_UNI_WETH',
  UNIUSDCWETH: 'UNI_USDC_WETH',
  UNIYFIWETH: 'UNI_YFI_WETH',
  BPTWBTCWETH: 'BPT_WBTC_WETH',
  BPTBALWETH: 'BPT_BAL_WETH',
};

export const NAME_MAP: { [key: string]: string } = {
  WETH: 'Wrapped ETH',
  UNIDAIWETH: 'UNI DAI/WETH',
  UNIWBTCUSDC: 'UNI WBTC/USDC',
  YFI: 'yearn.finance',
};

export function fetchIconSymbolAndName({
  underlyingAsset,
  symbol,
}: {
  underlyingAsset: string;
  symbol: string;
}) {
  // guni symbols are just broken (G-UNI for all tokens)
  if (
    underlyingAsset.toLowerCase() === '0x50379f632ca68d36e50cfbc8f78fe16bd1499d1e'.toLowerCase()
  ) {
    return { iconSymbol: 'GUNI_DAI_USDC', name: 'G-UNI DAI/USDC' };
  }
  if (
    underlyingAsset.toLowerCase() === '0xd2eec91055f07fe24c9ccb25828ecfefd4be0c41'.toLowerCase()
  ) {
    return { iconSymbol: 'GUNI_USDC_USDT', name: 'G-UNI USDC/USDT' };
  }
  // avalanche symbols have .e extensions
  if (/\.e/.test(symbol)) {
    const rawSymbol = symbol.replace('.e', '');
    return {
      iconSymbol: rawSymbol || symbol,
      name: `${NAME_MAP[rawSymbol] || rawSymbol} (${symbol})`,
    };
  }
  return {
    iconSymbol: SYMBOL_MAP[symbol] || symbol,
    name: NAME_MAP[symbol] || symbol,
  };
}
