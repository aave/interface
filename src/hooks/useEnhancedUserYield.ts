import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { useAppDataContext } from './app-data-provider/useAppDataProvider';
import { useUserYield } from './pool/useUserYield';

/**
 * Enhanced user yield hook that includes merit incentives in Net APY calculation
 * This provides a more comprehensive view of user returns including merit rewards
 */
export const useEnhancedUserYield = () => {
  const { currentAccount } = useWeb3Context();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { user } = useAppDataContext();

  const enhancedUserYield = useUserYield(currentMarketData, currentAccount);

  const netAPYWithMerit = enhancedUserYield.data?.netAPY ?? user?.netAPY ?? 0;
  const earnedAPYWithMerit = enhancedUserYield.data?.earnedAPY ?? 0;
  const debtAPYWithMerit = enhancedUserYield.data?.debtAPY ?? 0;

  return {
    netAPY: netAPYWithMerit,
    earnedAPY: earnedAPYWithMerit,
    debtAPY: debtAPYWithMerit,
    loading: enhancedUserYield.isPending,
    error: enhancedUserYield.error,
    hasEnhancedData: !!enhancedUserYield.data,
  };
};
