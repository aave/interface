import {
  COW_UNSUPPORTED_ASSETS,
  isChainIdSupportedByCoWProtocol,
} from '../../constants/cow.constants';
import { ParaswapSupportedNetworks } from '../../constants/paraswap.constants';
import { SwapProvider, SwapType } from '../../types';

/**
 * Returns whether CoW Protocol can handle the given pair/swapType on the chain.
 * Checks chain support and a per-flow unsupported assets list.
 * The backend runs every collateral swap on the flash-loan adapter, so the flow never changes
 * which list applies.
 */
export const isSwapSupportedByCowProtocol = (
  chainId: number,
  assetFrom: string,
  assetTo: string,
  swapType: SwapType
) => {
  if (!isChainIdSupportedByCoWProtocol(chainId)) return false;

  // Helper to normalize values that can be string[] or 'ALL' to always be an array
  const normalizeToArray = (value: string[] | 'ALL' | undefined): string[] => {
    if (!value) return [];
    if (value === 'ALL') return ['ALL'];
    return value;
  };

  const unsupportedAssetsPerChainAndModalType = [
    ...normalizeToArray(COW_UNSUPPORTED_ASSETS['ALL']?.[chainId]),
    ...normalizeToArray(COW_UNSUPPORTED_ASSETS[swapType]?.[chainId]),
  ];

  if (unsupportedAssetsPerChainAndModalType.length === 0) return true; // No unsupported assets for this chain and modal type

  if (unsupportedAssetsPerChainAndModalType.includes('ALL')) return false; // All assets are unsupported

  if (
    unsupportedAssetsPerChainAndModalType.includes(assetFrom.toLowerCase()) ||
    unsupportedAssetsPerChainAndModalType.includes(assetTo.toLowerCase())
  )
    return false;

  return true;
};

/**
 * Picks the provider for the current swap based on chain, assets and flow.
 *
 * Notes:
 * - CoW is preferred when supported; fallback to ParaSwap if supported on chain
 */
export const getSwitchProvider = ({
  chainId,
  assetFrom,
  assetTo,
  swapType,
}: {
  chainId: number;
  assetFrom: string;
  assetTo: string;
  swapType: SwapType;
}): SwapProvider | undefined => {
  if (isSwapSupportedByCowProtocol(chainId, assetFrom, assetTo, swapType)) {
    return SwapProvider.COW_PROTOCOL;
  }

  // Fallback to ParaSwap only if supported on this chain
  if (ParaswapSupportedNetworks.includes(chainId)) {
    return SwapProvider.PARASWAP;
  }
  return undefined;
};

/**
 * How the bought collateral of a collateral swap reaches the user's position, which decides
 * whether a newly bought asset can become collateral (see CalculateHFAfterSwapProps).
 * Both providers behave the same way:
 *
 * - Without a flash loan, the swap is a plain aToken -> aToken ParaSwap Augustus route
 *   (SwapActionsViaParaswap). Augustus or its executor, the supply recipient in ParaSwap's Aave
 *   route, transfers the bought aTokens to the user, so they arrive by transfer. CoW collateral
 *   swaps always run on the flash-loan adapter.
 *   ParaSwapLiquiditySwapAdapter.swapAndDeposit would supply instead, but the interface hasn't
 *   used it since #2581 (non-flash collateral swaps became aToken swaps).
 * - With a flash loan, the adapter supplies the bought asset on the user's behalf
 *   (CoW CollateralSwapAaveV3Adapter -> Pool.supply, ParaSwapLiquiditySwapAdapter -> Pool.deposit)
 *   before pulling the sold aTokens.
 */
export const getCollateralSwapReceivedVia = (
  useFlashloan: boolean | undefined
): 'supply' | 'transfer' => (useFlashloan ? 'supply' : 'transfer');
