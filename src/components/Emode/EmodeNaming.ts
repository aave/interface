export const getEmodeMessage = (categoryId: number): string => {
  if (categoryId === 1) {
    return 'Stablecoins';
  } else if (categoryId === 2) {
    return 'ETH';
  } else if (categoryId === 3) {
    return 'BTC';
  } else {
    return 'Stablecoins';
  }
};
