import { getSwapProvider } from './helpers';

export const useSwitchProvider = ({ chainId }: { chainId: number }) => {
  // TODO: Implement logic to get the swap provider. e.g. Launchdarkly flags.

  return getSwapProvider(chainId);
};
