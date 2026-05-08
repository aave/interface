import { valueToBigNumber } from '@aave/math-utils';

import { SwapProvider, SwapState, SwapType } from '../../types';

/**
 * Calculate flashloan fee amount for Paraswap adapter swaps.
 * The fee bps is resolved on-chain via ACLManager.isFlashBorrower; while the
 * check is in flight `state.flashLoanFeeBps` is undefined and we return zeros
 * so the caller doesn't render a stale value.
 *
 * @param state - Swap state
 * @returns Object containing flashloan fee amount in bigint and formatted string
 */
export const calculateParaswapFlashLoanFee = (
  state: SwapState
): {
  flashLoanFeeAmount: bigint;
  flashLoanFeeFormatted: string;
} => {
  // Only calculate fee for protocol swaps using Paraswap with flashloan
  if (
    state.swapType === SwapType.Swap ||
    state.provider !== SwapProvider.PARASWAP ||
    !state.useFlashloan ||
    !state.sellAmountBigInt ||
    state.flashLoanFeeBps === undefined
  ) {
    return {
      flashLoanFeeAmount: BigInt(0),
      flashLoanFeeFormatted: '0',
    };
  }

  // Calculate fee: flashloan amount * fee bps / 10000
  // The flashloan amount is the sell amount (collateral being swapped)
  const flashLoanFeeAmount =
    (state.sellAmountBigInt * BigInt(state.flashLoanFeeBps)) / BigInt(10000);

  // Format the fee amount
  const flashLoanFeeFormatted = valueToBigNumber(flashLoanFeeAmount.toString())
    .dividedBy(valueToBigNumber(10).pow(state.sellAmountToken?.decimals ?? 18))
    .toString();

  return {
    flashLoanFeeAmount,
    flashLoanFeeFormatted,
  };
};
