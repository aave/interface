import { SwitchProvider } from 'src/components/transactions/Switch/switch.types';

import { getSwapProvider as getSwapProviderForChain } from './helpers';

export const useSwitchProvider = ({
  chainId,
  shouldUseFlashloan,
}: {
  chainId: number;
  shouldUseFlashloan?: boolean;
}): SwitchProvider | undefined => {
  if (shouldUseFlashloan) return 'paraswap';

  return getSwapProviderForChain(chainId);
};
