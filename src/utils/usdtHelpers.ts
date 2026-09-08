import { MAX_UINT_AMOUNT } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { formatUnits } from 'ethers/lib/utils';

/**
 * Check if a token is USDT on Ethereum that requires approval reset
 * @param tokenSymbol - The token symbol
 * @param chainId - The chain ID
 * @returns true if the token is USDT on Ethereum
 */
export const isUSDTOnEthereum = (
  tokenSymbol: string,
  chainId: number,
  underlyingChainId?: number
): boolean => {
  const effectiveChainId = underlyingChainId ?? chainId;
  return tokenSymbol.toUpperCase() === 'USDT' && effectiveChainId === 1; // Ethereum mainnet
};

/**
 * The allowance the next `approve` call will actually grant, in token units, for comparison
 * against the allowance already on-chain.
 *
 * `signatureAmount` is not that figure. On a full repay it is the '-1' sentinel, which hides
 * a finite `amountToApprove` when the user asked for one and stands for an unlimited approve
 * when they did not - and `Number('-1')` reads as "nothing to approve" to every caller.
 *
 * @param amountToApprove - the finite allowance requested, in base units, if any
 * @param decimals - token decimals, to bring `amountToApprove` into token units
 * @param signatureAmount - the transaction amount, used when no finite allowance was requested
 */
export const getNewApprovalAmount = (
  amountToApprove: string | undefined,
  decimals: number,
  signatureAmount: string
): string => {
  if (amountToApprove) return formatUnits(amountToApprove, decimals);
  return signatureAmount === '-1' ? MAX_UINT_AMOUNT : signatureAmount;
};

/**
 * Check if USDT on Ethereum needs approval reset (current approval > 0 and new approval needed)
 * @param tokenSymbol - The token symbol
 * @param chainId - The chain ID
 * @param currentApproval - Current approved amount
 * @returns true if approval reset is needed
 */
export const needsUSDTApprovalReset = (
  tokenSymbol: string,
  chainId: number,
  currentApproval: string,
  newApproval: string,
  underlyingChainId?: number
): boolean => {
  return (
    isUSDTOnEthereum(tokenSymbol, chainId, underlyingChainId) &&
    Boolean(currentApproval) &&
    Boolean(newApproval) &&
    valueToBigNumber(currentApproval).isGreaterThan(0) &&
    valueToBigNumber(currentApproval).isLessThan(valueToBigNumber(newApproval))
  );
};

// Test cases:
// needsUSDTApprovalReset('USDT', 1, '1000') -> true (USDT on Ethereum with existing approval)
// needsUSDTApprovalReset('USDT', 1, '0') -> false (USDT on Ethereum with no approval)
// needsUSDTApprovalReset('USDT', 1, '-1') -> false (USDT on Ethereum with max approval)
// needsUSDTApprovalReset('USDT', 137, '1000') -> false (USDT on Polygon, no reset needed)
// needsUSDTApprovalReset('USDC', 1, '1000') -> false (USDC on Ethereum, no reset needed)
