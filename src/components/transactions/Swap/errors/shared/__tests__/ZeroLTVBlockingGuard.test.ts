import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { SwapState, SwapType } from '../../../types';
import { hasZeroLTVBlocking } from '../ZeroLTVBlockingGuard';

jest.mock('src/hooks/useZeroLTVBlockingWithdraw', () => ({
  useZeroLTVBlockingWithdraw: () => [],
}));
jest.mock('src/hooks/app-data-provider/useAppDataProvider', () => ({
  useAppDataContext: () => ({}),
}));

/**
 * Aave V3 Ethereum Core after the precautionary freeze (block 26302547): WETH is
 * frozen with LTV 0, and 0xb3af1f2bf9f25d649d17e271e25c851b3400d297 holds WETH
 * collateral against GHO debt. Pulling and withdrawing that aWETH succeeds on-chain.
 */
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const WSTETH = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
const GHO = '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f';

// User reserves carry lowercased addresses; tokens may carry checksummed ones.
const BLOCKING = [
  { underlyingAsset: WETH.toLowerCase(), reserve: { symbol: 'WETH' } },
] as unknown as FormattedUserReserves[];

const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

// The user's supplies with their on-user collateral flag.
const USER_RESERVES = [
  { underlyingAsset: WETH.toLowerCase(), usageAsCollateralEnabledOnUser: true },
  { underlyingAsset: WSTETH.toLowerCase(), usageAsCollateralEnabledOnUser: true },
  { underlyingAsset: WBTC.toLowerCase(), usageAsCollateralEnabledOnUser: false },
];

const token = (symbol: string, underlyingAddress: string) => ({ symbol, underlyingAddress });

// Swap reserves resolve in an effect after the first render, so they start unset.
const repayWithCollateral = (overrides: Record<string, unknown> = {}) =>
  ({
    swapType: SwapType.RepayWithCollateral,
    sourceToken: token('GHO', GHO),
    destinationToken: token('ETH', WETH),
    sourceReserve: undefined,
    destinationReserve: undefined,
    sellAmountToken: undefined,
    ...overrides,
  } as unknown as SwapState);

describe('hasZeroLTVBlocking', () => {
  it('allows repaying with the zero-LTV collateral before reserves or a quote resolve', () => {
    expect(hasZeroLTVBlocking(repayWithCollateral(), BLOCKING, USER_RESERVES)).toBe(false);
  });

  it('allows repaying with wrapped native collateral shown with its native symbol', () => {
    const state = repayWithCollateral({ sellAmountToken: token('ETH', WETH) });
    expect(hasZeroLTVBlocking(state, BLOCKING, USER_RESERVES)).toBe(false);
  });

  it('blocks repaying with collateral missing from the zero-LTV list', () => {
    const state = repayWithCollateral({ destinationToken: token('wstETH', WSTETH) });
    expect(hasZeroLTVBlocking(state, BLOCKING, USER_RESERVES)).toBe(true);
  });

  it('reads the source token on collateral swap', () => {
    const state = {
      swapType: SwapType.CollateralSwap,
      sourceToken: token('ETH', WETH),
      destinationToken: token('wstETH', WSTETH),
    } as unknown as SwapState;
    expect(hasZeroLTVBlocking(state, BLOCKING, USER_RESERVES)).toBe(false);
  });

  it('allows swapping out of a supply that is not enabled as collateral', () => {
    // executeWithdraw / finalizeTransfer only run validateHFAndLtvzero when the
    // withdrawn aToken is enabled as collateral for the user.
    const state = {
      swapType: SwapType.CollateralSwap,
      sourceToken: token('WBTC', WBTC),
      destinationToken: token('wstETH', WSTETH),
    } as unknown as SwapState;
    expect(hasZeroLTVBlocking(state, BLOCKING, USER_RESERVES)).toBe(false);
  });

  it('allows repaying with collateral that is not enabled as collateral', () => {
    const state = repayWithCollateral({ destinationToken: token('WBTC', WBTC) });
    expect(hasZeroLTVBlocking(state, BLOCKING, USER_RESERVES)).toBe(false);
  });
});
