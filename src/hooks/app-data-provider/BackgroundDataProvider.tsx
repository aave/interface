import React, { useContext } from 'react';
import {
  useGhoDataSubscription,
  useIncentiveDataSubscription,
  usePoolDataSubscription,
  useWalletBalancesSubscription,
} from 'src/store/root';

interface BackgroundDataProviderContextType {
  refetchGhoData: () => Promise<void>;
  refetchWalletBalances: () => Promise<void>;
  refetchIncentiveData?: () => Promise<void>;
  refetchPoolData?: () => Promise<void> | Promise<void[]>;
}

const BackgroundDataProviderContext = React.createContext<BackgroundDataProviderContextType>(
  {} as BackgroundDataProviderContextType
);

/**
 * Naive provider that subscribes to different data sources.
 * @param param0
 * @returns
 */
export const BackgroundDataProvider: React.FC = ({ children }) => {
  const refetchWalletBalances = useWalletBalancesSubscription();
  const refetchPoolData = usePoolDataSubscription();
  const refetchIncentiveData = useIncentiveDataSubscription();
  const refetchGhoData = useGhoDataSubscription();
  return (
    <BackgroundDataProviderContext.Provider
      value={{ refetchWalletBalances, refetchIncentiveData, refetchPoolData, refetchGhoData }}
    >
      {children}
    </BackgroundDataProviderContext.Provider>
  );
};

export const useBackgroundDataProvider = () => useContext(BackgroundDataProviderContext);
