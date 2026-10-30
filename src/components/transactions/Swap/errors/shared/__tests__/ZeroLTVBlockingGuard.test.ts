import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { SwapState, SwapType } from '../../../types';
import { hasZeroLTVBlocking } from '../ZeroLTVBlockingGuard';

jest.mock('src/hooks/useZeroLTVBlockingWithdraw', () => ({
  useZeroLTVBlockingWithdraw: () => [],
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
    expect(hasZeroLTVBlocking(repayWithCollateral(), BLOCKING)).toBe(false);
  });

  it('allows repaying with wrapped native collateral shown with its native symbol', () => {
    const state = repayWithCollateral({ sellAmountToken: token('ETH', WETH) });
    expect(hasZeroLTVBlocking(state, BLOCKING)).toBe(false);
  });

  it('blocks repaying with collateral missing from the zero-LTV list', () => {
    const state = repayWithCollateral({ destinationToken: token('wstETH', WSTETH) });
    expect(hasZeroLTVBlocking(state, BLOCKING)).toBe(true);
  });

  it('reads the source token on collateral swap', () => {
    const state = {
      swapType: SwapType.CollateralSwap,
      sourceToken: token('ETH', WETH),
      destinationToken: token('wstETH', WSTETH),
    } as unknown as SwapState;
    expect(hasZeroLTVBlocking(state, BLOCKING)).toBe(false);
  });
});
