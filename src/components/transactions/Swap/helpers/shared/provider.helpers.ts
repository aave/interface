import { ChainId } from '@aave/contract-helpers';

import {
  COW_UNSUPPORTED_ASSETS,
  isChainIdSupportedByCoWProtocol,
} from '../../constants/cow.constants';
import { SwapProvider, SwapType } from '../../types';

/**
 * Returns whether CoW Protocol can handle the given pair/swapType on the chain.
 * Checks chain support and a per-flow unsupported assets list.
 */
export const isSwapSupportedByCowProtocol = (
  chainId: number,
  assetFrom: string,
  assetTo: string,
  swapType: SwapType
) => {
  if (!isChainIdSupportedByCoWProtocol(chainId)) return false;

  const unsupportedAssetsPerChainAndModalType = [
    ...((COW_UNSUPPORTED_ASSETS['ALL'] && COW_UNSUPPORTED_ASSETS['ALL'][chainId]) || []),
    ...((COW_UNSUPPORTED_ASSETS[swapType] && COW_UNSUPPORTED_ASSETS[swapType][chainId]) || []),
  ].flat();

  if (unsupportedAssetsPerChainAndModalType === undefined) return true; // No unsupported assets for this chain and modal type

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
 * - CoW is preferred when supported; fallback to ParaSwap
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
  // TODO: REMOVE
  if (shouldUseFlashloan) {
    // CoW Adapters only deployed on Gnosis, Base and Mainnet for now
    if (
      chainId !== ChainId.xdai &&
      chainId !== ChainId.base &&
      chainId !== ChainId.mainnet &&
      swapType === SwapType.CollateralSwap
    ) {
      return SwapProvider.PARASWAP;
    }
  }

  if (isSwapSupportedByCowProtocol(chainId, assetFrom, assetTo, swapType)) {
    return SwapProvider.COW_PROTOCOL;
  }

  return SwapProvider.PARASWAP;
};
