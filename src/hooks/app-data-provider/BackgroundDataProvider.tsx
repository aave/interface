import React, { useContext } from 'react';
import { useWalletBalancesSubscription } from 'src/store/root';

import { useIncentiveData } from './useIncentiveData';
import { usePoolData } from './usePoolData';

interface BackgroundDataProviderContextType {
  refetchWalletBalances: () => Promise<void>;
  refechIncentiveData?: () => Promise<void>;
  refetchPoolData?: () => Promise<void> | Promise<void[]>;
}

const BackgroundDataProviderContext = React.createContext<BackgroundDataProviderContextType>(
  {} as BackgroundDataProviderContextType
);

/**
 * Naive provider that subscribes to different data sources to update the apollo cache.
 * @param param0
 * @returns
 */
export const BackgroundDataProvider: React.FC = ({ children }) => {
  const { refresh: refechIncentiveData } = useIncentiveData();
  const { refresh: refetchPoolData } = usePoolData();
  const refetchWalletBalances = useWalletBalancesSubscription();
  return (
    <BackgroundDataProviderContext.Provider
      value={{ refetchWalletBalances, refechIncentiveData, refetchPoolData }}
    >
      {children}
    </BackgroundDataProviderContext.Provider>
  );
};

export const useBackgroundDataProvider = () => useContext(BackgroundDataProviderContext);
