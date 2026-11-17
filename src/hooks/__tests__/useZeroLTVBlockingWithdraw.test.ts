import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { isBlockedByZeroLTV } from '../useZeroLTVBlockingWithdraw';

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
