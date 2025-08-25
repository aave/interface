import { COW_UNSUPPORTED_ASSETS } from 'src/components/transactions/Switch/cowprotocol/cowprotocol.constants';
import { isChainIdSupportedByCoWProtocol } from 'src/components/transactions/Switch/switch.constants';
import { SwitchProvider } from 'src/components/transactions/Switch/switch.types';
import { ModalType } from 'src/hooks/useModal';

export const isSwapSupportedByCowProtocol = (
  chainId: number,
  assetFrom: string,
  assetTo: string,
  modalType: ModalType
) => {
  if (!isChainIdSupportedByCoWProtocol(chainId)) return false;

  const unsupportedAssetsPerChainAndModalType =
    COW_UNSUPPORTED_ASSETS[modalType] && COW_UNSUPPORTED_ASSETS[modalType][chainId];

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
  modalType,
}: {
  chainId: number;
  assetFrom: string;
  assetTo: string;
  shouldUseFlashloan?: boolean;
  modalType: ModalType;
}): SwitchProvider | undefined => {
  if (shouldUseFlashloan) return 'paraswap';

  if (isSwapSupportedByCowProtocol(chainId, assetFrom, assetTo, modalType)) {
    return 'cowprotocol';
  }

  return 'paraswap';
};
