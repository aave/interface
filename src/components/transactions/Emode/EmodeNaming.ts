export const getEmodeMessage = (categoryId: number, baseAssetSymbol: string): string => {
  if (categoryId === 0) {
    return 'Disabled';
  } else if (categoryId === 1) {
    return 'Stablecoins';
  } else if (categoryId === 2) {
    return baseAssetSymbol;
  } else if (categoryId === 3) {
    return 'BTC';
  } else {
    return 'unknown';
  }
};
