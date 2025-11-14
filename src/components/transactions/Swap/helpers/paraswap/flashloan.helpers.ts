import { valueToBigNumber } from '@aave/math-utils';

import { PARASWAP_FLASH_LOAN_FEE_BPS } from '../../constants/paraswap.constants';
import { SwapProvider, SwapState, SwapType } from '../../types';

/**
 * Calculate flashloan fee amount for Paraswap adapter swaps.
 * The fee is 0.05% (5 bps) of the flashloan amount, which is the sell amount.
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
    !state.sellAmountBigInt
  ) {
    return {
      flashLoanFeeAmount: BigInt(0),
      flashLoanFeeFormatted: '0',
    };
  }

  // Calculate fee: flashloan amount * fee bps / 10000
  // The flashloan amount is the sell amount (collateral being swapped)
  const flashLoanFeeAmount =
    (state.sellAmountBigInt * BigInt(PARASWAP_FLASH_LOAN_FEE_BPS)) / BigInt(10000);

  // Format the fee amount
  const flashLoanFeeFormatted = valueToBigNumber(flashLoanFeeAmount.toString())
    .dividedBy(valueToBigNumber(10).pow(state.sellAmountToken?.decimals ?? 18))
    .toString();

  return {
    flashLoanFeeAmount,
    flashLoanFeeFormatted,
  };
};
