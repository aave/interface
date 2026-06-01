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
 * - EIP-7702 delegated EOAs always fall back to ParaSwap. Smart-account delegates
 *   (Alchemy MA v2, etc.) intercept signTypedData and return wrapped signatures
 *   that don't ecrecover to the EOA, breaking both EIP-712 order signing and the
 *   flash-loan adapter's EIP-1271 wrapper.
 */
export const getSwitchProvider = ({
  chainId,
  assetFrom,
  assetTo,
  shouldUseFlashloan,
  swapType,
  userIsEip7702Wallet,
}: {
  chainId: number;
  assetFrom: string;
  assetTo: string;
  shouldUseFlashloan?: boolean;
  swapType: SwapType;
  userIsEip7702Wallet?: boolean;
}): SwapProvider | undefined => {
  if (
    !userIsEip7702Wallet &&
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
