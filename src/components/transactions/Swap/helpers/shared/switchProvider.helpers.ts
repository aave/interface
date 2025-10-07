import {
  COW_UNSUPPORTED_ASSETS,
  isChainIdSupportedByCoWProtocol,
} from '../../constants/cow.constants';
import { SwapProvider, SwapType } from '../../types';

export const isSwapSupportedByCowProtocol = (
  chainId: number,
  assetFrom: string,
  assetTo: string,
  swapType: SwapType
) => {
  if (!isChainIdSupportedByCoWProtocol(chainId)) return false;

  const unsupportedAssetsPerChainAndModalType =
    COW_UNSUPPORTED_ASSETS[swapType] && COW_UNSUPPORTED_ASSETS[swapType][chainId];

  if (unsupportedAssetsPerChainAndModalType === undefined) return true; // No unsupported assets for this chain and modal type

  if (unsupportedAssetsPerChainAndModalType === 'ALL') return false; // All assets are unsupported

  if (
    unsupportedAssetsPerChainAndModalType.includes(assetFrom.toLowerCase()) ||
    unsupportedAssetsPerChainAndModalType.includes(assetTo.toLowerCase())
  )
    return false;

  return true;
};

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
  if (shouldUseFlashloan) return SwapProvider.PARASWAP;

  if (isSwapSupportedByCowProtocol(chainId, assetFrom, assetTo, swapType)) {
    return SwapProvider.COW_PROTOCOL;
  }

  return SwapProvider.PARASWAP;
};
