import { unPrefixSymbol } from 'src/hooks/app-data-provider/useAppDataProvider';

/**
 * Maps onchain symbols to different symbols.
 * This is useful when you want to explode symbols via _ to render multiple symbols or when the symbol has a bridge prefix or suffix.
 */
export const SYMBOL_MAP: { [key: string]: string } = {
  BPTBALWETH: 'BPT_BAL_WETH',
  BPTWBTCWETH: 'BPT_WBTC_WETH',
  UNIAAVEWETH: 'UNI_AAVE_WETH',
  UNIBATWETH: 'UNI_BAT_WETH',
  UNICRVWETH: 'UNI_CRV_WETH',
  UNIDAIUSDC: 'UNI_DAI_USDC',
  UNIDAIWETH: 'UNI_DAI_WETH',
  UNILINKWETH: 'UNI_LINK_WETH',
  UNIMKRWETH: 'UNI_MKR_WETH',
  UNIRENWETH: 'UNI_REN_WETH',
  UNISNXWETH: 'UNI_SNX_WETH',
  UNIUNIWETH: 'UNI_UNI_WETH',
  UNIUSDCWETH: 'UNI_USDC_WETH',
  UNIWBTCUSDC: 'UNI_WBTC_USDC',
  UNIWBTCWETH: 'UNI_WBTC_WETH',
  UNIYFIWETH: 'UNI_YFI_WETH',
  fUSDT: 'USDT',
  // harmony
  '1DAI': 'DAI',
  '1USDC': 'USDC',
  '1USDT': 'USDT',
  '1AAVE': 'AAVE',
  '1ETH': 'ETH',
  '1WBTC': 'WBTC',
  // avalanche
  'DAI.e': 'DAI',
  'LINK.e': 'LINK',
  'WBTC.e': 'WBTC',
  'WETH.e': 'WETH',
  'AAVE.e': 'AAVE',
  'USDT.e': 'USDT',
  'USDC.e': 'USDC',
  'BTC.b': 'BTC',
  // polygon
  miMATIC: 'MAI',
  // metis
  'm.USDC': 'USDC',
  'm.USDT': 'USDT',
  'm.DAI': 'DAI',
};

/**
 * Maps (potentially altered via SYMBOL_MAP) symbols to a name
 * With the next version of uipooldataprovider https://github.com/aave/aave-v3-periphery/pull/89 this list can be greatly reduced/removed.
 */
export const SYMBOL_NAME_MAP: { [key: string]: string } = {
  AVAX: 'Avalanche',
  ETH: 'Ethereum',
  EUROS: 'STASIS EURO',
  FAI: 'Fei USD',
  GHST: 'Aavegotchi GHST',
  GUSD: 'Gemini Dollar',
  KNC: 'Kyber Legacy',
  LINK: 'ChainLink',
  MAI: 'MAI (mimatic)',
  MANA: 'Decentraland',
  MKR: 'Maker',
  PAX: 'Paxos Standard',
  RAI: 'Rai Reflex Index',
  REP: 'Augur',
  SAVAX: 'Benqi Staked Avalanche',
  STETH: 'Lido Staked Ether',
  STKAAVE: 'Stake Aave',
  TUSD: 'TrueUSD',
  UNI: 'Uniswap',
  UNIDAIWETH: 'UNI DAI/WETH',
  UNIWBTCUSDC: 'UNI WBTC/USDC',
  USDT: 'Tether',
  WAVAX: 'Wrapped Avalanche',
  WBTC: 'Wrapped BTC',
  WETH: 'Wrapped ETH',
  WFTM: 'Wrapped FTM',
  WMATIC: 'Wrapped Matic',
  WONE: 'Wrapped ONE',
  YFI: 'yearn.finance',
  ZRX: '0x Coin',
  '1INCH': '1inch Network',
  LUSD: 'LUSD Stablecoin',
};

export function fetchIconSymbolAndName({
  underlyingAsset,
  symbol,
  name,
}: {
  underlyingAsset: string;
  symbol: string;
  name?: string;
}) {
  // guni symbols are just broken (G-UNI for all tokens)
  if (
    underlyingAsset.toLowerCase() === '0x50379f632ca68d36e50cfbc8f78fe16bd1499d1e'.toLowerCase()
  ) {
    return { iconSymbol: 'GUNI_DAI_USDC', name: 'G-UNI DAI/USDC', symbol };
  }
  if (
    underlyingAsset.toLowerCase() === '0xd2eec91055f07fe24c9ccb25828ecfefd4be0c41'.toLowerCase()
  ) {
    return { iconSymbol: 'GUNI_USDC_USDT', name: 'G-UNI USDC/USDT', symbol };
  }
  if (
    underlyingAsset.toLowerCase() === '0xa693B19d2931d498c5B318dF961919BB4aee87a5'.toLowerCase()
  ) {
    return { iconSymbol: 'UST', name: 'UST (Wormhole)', symbol };
  }

  // TO-DO: handle this separately for tx history, removing the prefix is only necessary with symbols coming from subgraph
  const unifiedSymbol = unPrefixSymbol((SYMBOL_MAP[symbol] || symbol).toUpperCase(), 'AMM');
  return {
    iconSymbol: unifiedSymbol,
    name: SYMBOL_NAME_MAP[unifiedSymbol.toUpperCase()] || name || unifiedSymbol,
    symbol,
  };
}

// tokens flagged stable will be sorted on top when no other sorting is selected
export const STABLE_ASSETS = [
  'DAI',
  'TUSD',
  'BUSD',
  'GUSD',
  'USDC',
  'USDT',
  'EUROS',
  'FEI',
  'FRAX',
  'PAX',
  'USDP',
  'SUSD',
  'UST',
  'EURS',
  'JEUR',
  'AGEUR',
  'LUSD',
  'MAI',
];
