import { getSwapProvider } from './helpers';

export const useSwitchProvider = ({ chainId }: { chainId: number }) => {
  // Here we can implement any logic to get the swap provider. e.g. Launchdarkly flags.

  return getSwapProvider(chainId);
};
