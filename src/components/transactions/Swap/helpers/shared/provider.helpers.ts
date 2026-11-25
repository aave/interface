import {
  COW_UNSUPPORTED_ASSETS,
  isChainIdSupportedByCoWProtocol,
} from '../../constants/cow.constants';
import { ParaswapSupportedNetworks } from '../../constants/paraswap.constants';
import { SwapProvider, SwapType } from '../../types';

/**
 * Token swaps routed to CoW are quoted and placed by the Aave backend; position flows still post
 * to CoW from the browser.
 */
export const isSwapViaBackend = (provider: SwapProvider | undefined, swapType: SwapType) =>
  provider === SwapProvider.COW_PROTOCOL && swapType === SwapType.Swap;

/**
 * Returns whether CoW Protocol can handle the given pair/swapType on the chain.
 * Checks chain support and a per-flow unsupported assets list.
 */
export const isSwapSupportedByCowProtocol = (
  chainId: number,
  assetFrom: string,
  assetTo: string,
  swapType: SwapType,
  useFlashloan: boolean
) => {
  if (!isChainIdSupportedByCoWProtocol(chainId)) return false;

  let swapTypeToUse = swapType;
  if (useFlashloan == false && swapType === SwapType.CollateralSwap) {
    swapTypeToUse = SwapType.Swap;
  }

  // Helper to normalize values that can be string[] or 'ALL' to always be an array
  const normalizeToArray = (value: string[] | 'ALL' | undefined): string[] => {
    if (!value) return [];
    if (value === 'ALL') return ['ALL'];
    return value;
  };

  const unsupportedAssetsPerChainAndModalType = [
    ...normalizeToArray(COW_UNSUPPORTED_ASSETS['ALL']?.[chainId]),
    ...normalizeToArray(COW_UNSUPPORTED_ASSETS[swapTypeToUse]?.[chainId]),
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
  shouldUseFlashloan,
  swapType,
}: {
  chainId: number;
  assetFrom: string;
  assetTo: string;
  shouldUseFlashloan?: boolean;
  swapType: SwapType;
}): SwapProvider | undefined => {
  if (
    isSwapSupportedByCowProtocol(chainId, assetFrom, assetTo, swapType, shouldUseFlashloan ?? false)
  ) {
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
 * - Without a flash loan, the swap is a plain aToken -> aToken swap: a CoW order, or a ParaSwap
 *   Augustus route (SwapActionsViaParaswap). Whoever holds the bought aTokens at the end (CoW
 *   settlement, or Augustus / its executor, which is the supply recipient in ParaSwap's Aave
 *   route) transfers them to the user, so they arrive by transfer.
 *   ParaSwapLiquiditySwapAdapter.swapAndDeposit would supply instead, but the interface hasn't
 *   used it since #2581 (non-flash collateral swaps became aToken swaps).
 * - With a flash loan, the adapter supplies the bought asset on the user's behalf
 *   (CoW CollateralSwapAaveV3Adapter -> Pool.supply, ParaSwapLiquiditySwapAdapter -> Pool.deposit)
 *   before pulling the sold aTokens.
 */
export const getCollateralSwapReceivedVia = (
  useFlashloan: boolean | undefined
): 'supply' | 'transfer' => (useFlashloan ? 'supply' : 'transfer');
