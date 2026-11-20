import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { getZeroLTVBlockingReserves, isBlockedByZeroLTV } from '../useZeroLTVBlockingWithdraw';

jest.mock('src/hooks/app-data-provider/useAppDataProvider', () => ({}));
jest.mock('src/hooks/pool/useExtendedUserSummaryAndIncentives', () => ({}));
jest.mock('src/store/root', () => ({}));

/**
 * Aave V3 Ethereum Core: tBTC is frozen with LTV 0 and enabled as collateral
 * alongside WETH, against stablecoin debt. aWBTC received from a collateral swap
 * sits with collateral disabled.
 */
const TBTC = '0x18084fbA666a33d37592fA2633fD49a74DD93a88';
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

const BLOCKING = [
  { underlyingAsset: TBTC.toLowerCase(), reserve: { symbol: 'tBTC' } },
] as unknown as FormattedUserReserves[];

const supply = (underlyingAsset: string, usageAsCollateralEnabledOnUser: boolean) => ({
  underlyingAsset: underlyingAsset.toLowerCase(),
  usageAsCollateralEnabledOnUser,
});

describe('isBlockedByZeroLTV', () => {
  it('does not block without zero-LTV collateral', () => {
    expect(isBlockedByZeroLTV([], supply(WETH, true))).toBe(false);
  });

  it('blocks removing other collateral while zero-LTV collateral is enabled', () => {
    expect(isBlockedByZeroLTV(BLOCKING, supply(WETH, true))).toBe(true);
  });

  it('allows removing the zero-LTV collateral itself', () => {
    expect(isBlockedByZeroLTV(BLOCKING, supply(TBTC, true))).toBe(false);
  });

  it('allows withdrawing or enabling a supply that is not enabled as collateral', () => {
    // executeWithdraw only runs validateHFAndLtvzero for collateral, and enabling
    // collateral never runs it.
    expect(isBlockedByZeroLTV(BLOCKING, supply(WBTC, false))).toBe(false);
  });
});

describe('getZeroLTVBlockingReserves', () => {
  const userReserve = (
    underlyingAsset: string,
    baseLTVasCollateral: string,
    usageAsCollateralEnabledOnUser = true
  ) => ({
    underlyingAsset: underlyingAsset.toLowerCase(),
    scaledATokenBalance: '1000',
    usageAsCollateralEnabledOnUser,
    reserve: { baseLTVasCollateral, reserveLiquidationThreshold: '7800', eModes: [] },
  });

  const summary = (totalBorrowsUSD: string) => ({
    totalBorrowsUSD,
    isInEmode: false,
    userEmodeCategoryId: 0,
    userReservesData: [
      userReserve(TBTC, '0'),
      userReserve(WETH, '8000'),
      userReserve(WBTC, '0', false),
    ],
  });

  it('lists zero-LTV collateral that is enabled when the user has debt', () => {
    expect(getZeroLTVBlockingReserves(summary('100'), {}).map((r) => r.underlyingAsset)).toEqual([
      TBTC.toLowerCase(),
    ]);
  });

  it('returns nothing without debt (withdraw / transfer skip the check)', () => {
    expect(getZeroLTVBlockingReserves(summary('0'), {})).toEqual([]);
  });

  it('still lists it without debt when ignoreDebt is set (disabling collateral always checks)', () => {
    const blocking = getZeroLTVBlockingReserves(summary('0'), {}, { ignoreDebt: true });
    expect(blocking.map((r) => r.underlyingAsset)).toEqual([TBTC.toLowerCase()]);
    // Disabling WETH reverts on-chain with LtvValidationFailed; disabling tBTC itself is allowed.
    expect(isBlockedByZeroLTV(blocking, supply(WETH, true))).toBe(true);
    expect(isBlockedByZeroLTV(blocking, supply(TBTC, true))).toBe(false);
  });
});
