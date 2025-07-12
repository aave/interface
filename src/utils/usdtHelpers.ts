/**
 * Check if a token is USDT on Ethereum that requires approval reset
 * @param tokenSymbol - The token symbol
 * @param chainId - The chain ID
 * @returns true if the token is USDT on Ethereum
 */
export const isUSDTOnEthereum = (tokenSymbol: string, chainId: number): boolean => {
  return tokenSymbol.toUpperCase() === 'USDT' && chainId === 1; // Ethereum mainnet
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
  currentApproval: bigint,
  newApproval: bigint
): boolean => {
  return (
    isUSDTOnEthereum(tokenSymbol, chainId) &&
    Boolean(currentApproval) &&
    Boolean(newApproval) &&
    currentApproval < newApproval
  );
};

// Test cases:
// needsUSDTApprovalReset('USDT', 1, '1000') -> true (USDT on Ethereum with existing approval)
// needsUSDTApprovalReset('USDT', 1, '0') -> false (USDT on Ethereum with no approval)
// needsUSDTApprovalReset('USDT', 1, '-1') -> false (USDT on Ethereum with max approval)
// needsUSDTApprovalReset('USDT', 137, '1000') -> false (USDT on Polygon, no reset needed)
// needsUSDTApprovalReset('USDC', 1, '1000') -> false (USDC on Ethereum, no reset needed)
