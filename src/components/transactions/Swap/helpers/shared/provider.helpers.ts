import {
  COW_UNSUPPORTED_ASSETS,
  isChainIdSupportedByCoWProtocol,
} from '../../constants/cow.constants';
import { ParaswapSupportedNetworks } from '../../constants/paraswap.constants';
import { SwapProvider, SwapType } from '../../types';

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
 *
 * - CoW simple order: an aToken -> aToken order, so the bought aTokens arrive by transfer.
 * - CoW flash-loan adapter: the adapter supplies the bought asset on the user's behalf
 *   (CollateralSwapAaveV3Adapter.collateralSwapWithFlashLoan -> Pool.supply).
 * - ParaSwap: treated as a supply (unchanged behaviour); its flows have not been audited here.
 */
export const getCollateralSwapReceivedVia = (
  provider: SwapProvider | undefined,
  useFlashloan: boolean | undefined
): 'supply' | 'transfer' =>
  provider === SwapProvider.COW_PROTOCOL && !useFlashloan ? 'transfer' : 'supply';
