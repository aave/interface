import { useRootStore } from 'src/store/root';

import { useAppDataContext } from './app-data-provider/useAppDataProvider';
import { useUserYield } from './pool/useUserYield';

/**
 * User yield hook that computes the aggregate Net APY across the user's positions,
 * falling back to the summary's netAPY when the per-position calculation is unavailable.
 */
export const useEnhancedUserYield = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { user } = useAppDataContext();

  const enhancedUserYield = useUserYield(currentMarketData);

  const netAPY = enhancedUserYield.data?.netAPY ?? user?.netAPY ?? 0;
  const earnedAPY = enhancedUserYield.data?.earnedAPY ?? 0;
  const debtAPY = enhancedUserYield.data?.debtAPY ?? 0;

  return {
    netAPY,
    earnedAPY,
    debtAPY,
    loading: enhancedUserYield.isPending,
    error: enhancedUserYield.error,
    hasEnhancedData: !!enhancedUserYield.data,
  };
};
