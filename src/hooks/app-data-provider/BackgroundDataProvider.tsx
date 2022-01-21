import React from 'react';
import { useIncentiveData } from './useIncentiveData';
import { usePoolData } from './usePoolData';
import { useUpdateWalletBalances } from './useWalletBalances';

interface BackgroundDataProviderContextType {
  refetchWalletBalances: () => Promise<void>;
}

const BackgroundDataProviderContext = React.createContext<BackgroundDataProviderContextType>({
  refetchWalletBalances: async () => {},
});

/**
 * Naive provider that subscribes to different data sources to update the apollo cache.
 * @param param0
 * @returns
 */
export const BackgroundDataProvider: React.FC = ({ children }) => {
  // useIncentiveData();
  // usePoolData();
  const { refetch: refetchWalletBalances } = useUpdateWalletBalances();
  console.log('rerender');
  return (
    <BackgroundDataProviderContext.Provider value={{ refetchWalletBalances }}>
      {children}
    </BackgroundDataProviderContext.Provider>
  );
};
