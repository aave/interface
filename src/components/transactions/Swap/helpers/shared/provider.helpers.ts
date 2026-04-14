import { ParaswapSupportedNetworks } from '../../constants/paraswap.constants';
import { SwapProvider, SwapType } from '../../types';

/**
 * Picks the provider for the current swap based on chain, assets and flow.
 *
 * Notes:
 * - ParaSwap is the sole provider; CoW Protocol is paused.
 */
export const getSwitchProvider = ({
  chainId,
}: {
  chainId: number;
  assetFrom: string;
  assetTo: string;
  shouldUseFlashloan?: boolean;
  swapType: SwapType;
}): SwapProvider | undefined => {
  if (ParaswapSupportedNetworks.includes(chainId)) {
    return SwapProvider.PARASWAP;
  }
  return undefined;
};
