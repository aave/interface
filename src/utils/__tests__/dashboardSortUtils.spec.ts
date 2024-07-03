import { sortPriorityReserve } from '../dashboardSortUtils';
import { GHO_SYMBOL } from '../ghoUtilities';

describe('dashboardSortUtils', () => {
  it('should place the priority reserve at the top if wallet balance is non-zero', () => {
    const mockPositions = [
      {
        reserve: { symbol: 'ETH' },
        walletBalanceUSD: '0',
      },
      {
        reserve: { symbol: 'wBTC' },
        walletBalanceUSD: '0',
      },
      {
        reserve: { symbol: GHO_SYMBOL },
        walletBalanceUSD: '1',
      },
    ];

    const result = sortPriorityReserve(GHO_SYMBOL, mockPositions);
    expect(result[0].reserve.symbol).toEqual(GHO_SYMBOL);
  });
  it('should place the priority reserve at the top when all balances are zero', () => {
    const mockPositions = [
      {
        reserve: { symbol: 'ETH' },
        walletBalanceUSD: '0',
      },
      {
        reserve: { symbol: 'BTC' },
        walletBalanceUSD: '0',
      },
      {
        reserve: { symbol: GHO_SYMBOL },
        walletBalanceUSD: '0',
      },
    ];

    const result = sortPriorityReserve(GHO_SYMBOL, mockPositions);
    expect(result[0].reserve.symbol).toEqual(GHO_SYMBOL);
  });
  it('should place the priority reserve after all non-zero balance items if the wallet balance is zero', () => {
    const mockPositions = [
      {
        reserve: { symbol: 'ETH' },
        walletBalanceUSD: '0',
      },
      {
        reserve: { symbol: 'BTC' },
        walletBalanceUSD: '1',
      },
      {
        reserve: { symbol: GHO_SYMBOL },
        walletBalanceUSD: '0',
      },
    ];

    const result = sortPriorityReserve(GHO_SYMBOL, mockPositions);
    expect(result[1].reserve.symbol).toEqual(GHO_SYMBOL);
  });
  it('should return the same positions if the priority reserve is not found', () => {
    const mockPositions = [
      {
        reserve: { symbol: 'ETH' },
        walletBalanceUSD: '0',
      },
      {
        reserve: { symbol: 'BTC' },
        walletBalanceUSD: '0',
      },
    ];

    const result = sortPriorityReserve(GHO_SYMBOL, mockPositions);
    expect(result).toEqual(mockPositions);
  });
});
