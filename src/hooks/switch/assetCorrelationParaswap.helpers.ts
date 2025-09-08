const ETH_CORRELATED_ASSETS = ['ETH', 'WETH', 'STETH', 'WSTETH', 'WEETH', 'RETH', 'CBETH'];

const STABLECOINS = ['USDT', 'USDC', 'DAI', 'FRAX', 'LUSD', 'GUSD'];
const BTC_CORRELATED_ASSETS = ['BTC', 'WBTC', 'TBTC', 'LBTC', 'FBTC', 'EBTC', 'CBBTC'];

export const areAssetsCorrelated = (inputSymbol: string, outputSymbol: string): boolean => {
  const input = inputSymbol.toUpperCase();
  const output = outputSymbol.toUpperCase();

  if (ETH_CORRELATED_ASSETS.includes(input) && ETH_CORRELATED_ASSETS.includes(output)) {
    return true;
  }

  if (STABLECOINS.includes(input) && STABLECOINS.includes(output)) {
    return true;
  }
  if (BTC_CORRELATED_ASSETS.includes(input) && BTC_CORRELATED_ASSETS.includes(output)) {
    return true;
  }

  return false;
};

export const getParaswapSlippage = (inputSymbol: string, outputSymbol: string): string => {
  return areAssetsCorrelated(inputSymbol, outputSymbol) ? '0.10' : '0.20';
};
