import React, { useContext } from 'react';
import { useIncentiveData } from './useIncentiveData';
import { usePoolData } from './usePoolData';
import { useUpdateWalletBalances } from './useWalletBalances';

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
  const { refetch: refetchWalletBalances } = useUpdateWalletBalances();
  return (
    <BackgroundDataProviderContext.Provider
      value={{ refetchWalletBalances, refechIncentiveData, refetchPoolData }}
    >
      {children}
    </BackgroundDataProviderContext.Provider>
  );
};

export const useBackgroundDataProvider = () => useContext(BackgroundDataProviderContext);
