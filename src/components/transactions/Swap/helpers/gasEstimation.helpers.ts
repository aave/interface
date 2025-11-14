import { APPROVAL_GAS_LIMIT } from 'src/components/transactions/utils';
import { TxStateType } from 'src/hooks/useModal';

import { COW_PROTOCOL_GAS_LIMITS } from '../constants/cow.constants';
import { PARASWAP_GAS_LIMITS } from '../constants/paraswap.constants';
import { SwapProvider, SwapType, TokenType } from '../types';

// Helper function to check if token is native
const isNativeToken = (address: string): boolean => {
  return (
    address === '0x0000000000000000000000000000000000000000' ||
    address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  );
};

export interface GasEstimationParams {
  swapType: SwapType;
  provider: SwapProvider;
  sourceToken: { addressToSwap: string; tokenType: TokenType };
  userIsSmartContractWallet: boolean;
  requiresApproval: boolean;
  requiresApprovalReset: boolean;
  approvalTxState: TxStateType;
  useFlashloan: boolean;
  usePermit: boolean;
}

export interface GasEstimationResult {
  gasLimit: string;
  showGasStation: boolean;
  breakdown: {
    baseGas: number;
    approvalGas: number;
    resetApprovalGas: number;
    total: number;
  };
}

/**
 * Centralized gas estimation logic for all swap types and providers
 */
export const estimateSwapGas = (params: GasEstimationParams): GasEstimationResult => {
  const {
    swapType,
    provider,
    sourceToken,
    userIsSmartContractWallet,
    requiresApproval,
    requiresApprovalReset,
    approvalTxState,
    useFlashloan,
    usePermit,
  } = params;

  let baseGas = 0;
  let approvalGas = 0;
  let resetApprovalGas = 0;
  let showGasStation = false;
  // Drastically reduced version of base gas estimation
  if (provider === SwapProvider.PARASWAP) {
    baseGas = PARASWAP_GAS_LIMITS[swapType] ?? 0;
    showGasStation = true;
  } else if (provider === SwapProvider.COW_PROTOCOL) {
    const isEthNativeSwap = isNativeToken(sourceToken.addressToSwap);
    if (
      (swapType === SwapType.Swap && (isEthNativeSwap || userIsSmartContractWallet)) ||
      (swapType === SwapType.CollateralSwap && !useFlashloan)
    ) {
      baseGas = COW_PROTOCOL_GAS_LIMITS[swapType] ?? 0;
      showGasStation = true;
    } else {
      baseGas = 0;
      showGasStation = false;
    }
  } else {
    baseGas = 0;
    showGasStation = false;
  }

  // Add approval gas if needed
  if (requiresApproval && !approvalTxState.success && !usePermit) {
    approvalGas = Number(APPROVAL_GAS_LIMIT);
    showGasStation = true;
  }

  // Add reset approval gas if needed
  if (requiresApprovalReset && !usePermit) {
    resetApprovalGas = Number(APPROVAL_GAS_LIMIT);
    showGasStation = true;
  }

  const total = baseGas + approvalGas + resetApprovalGas;

  return {
    gasLimit: total.toString(),
    showGasStation,
    breakdown: {
      baseGas,
      approvalGas,
      resetApprovalGas,
      total,
    },
  };
};

/**
 * Determines if a swap requires gas based on provider and token types
 */
export const shouldShowGasStation = (
  provider: SwapProvider,
  sourceToken: { addressToSwap: string; tokenType: TokenType },
  userIsSmartContractWallet: boolean,
  requiresApproval: boolean
): boolean => {
  // Always show gas station for Paraswap
  if (provider === SwapProvider.PARASWAP) {
    return true;
  }

  // For CoW Protocol, only show gas station for ETH-native swaps or smart contract wallets
  if (provider === SwapProvider.COW_PROTOCOL) {
    const isEthNativeSwap = isNativeToken(sourceToken.addressToSwap);
    return isEthNativeSwap || userIsSmartContractWallet || requiresApproval;
  }

  // For other providers, show gas station if approval is required
  return requiresApproval;
};

/**
 * Gets gas estimation for native token swaps (ETH, MATIC, etc.)
 */
export const getNativeTokenGasEstimation = (
  chainId: number,
  tokenType: TokenType
): { gasRequired: string; showWarning: boolean } => {
  // Different gas requirements for different chains
  const gasRequirements = {
    1: '0.01', // Ethereum mainnet
    137: '0.001', // Polygon
    42161: '0.001', // Arbitrum
    10: '0.001', // Optimism
    56: '0.001', // BSC
    43114: '0.001', // Avalanche
  };

  const gasRequired = gasRequirements[chainId as keyof typeof gasRequirements] || '0.001';
  const showWarning = tokenType === TokenType.NATIVE;

  return { gasRequired, showWarning };
};
