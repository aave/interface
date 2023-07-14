import React, { useContext } from 'react';
import {
  useGhoDataSubscription,
  useIncentiveDataSubscription,
  usePoolDataSubscription,
} from 'src/store/root';

interface BackgroundDataProviderContextType {
  refetchGhoData: () => Promise<void>;
  refetchIncentiveData?: () => Promise<void>;
  refetchPoolData?: () => Promise<void> | Promise<void[]>;
}

const BackgroundDataProviderContext = React.createContext<BackgroundDataProviderContextType>(
  {} as BackgroundDataProviderContextType
);

/**
 * Naive provider that subscribes to different data sources.
 * This context provider will run useEffects that relate to instantiating subscriptions as a poll every 60s to consistently fetch data from on-chain and update the Zustand global store.
 * @returns
 */
export const BackgroundDataProvider: React.FC = ({ children }) => {
  const refetchPoolData = usePoolDataSubscription();
  const refetchIncentiveData = useIncentiveDataSubscription();
  const refetchGhoData = useGhoDataSubscription();
  return (
    <BackgroundDataProviderContext.Provider
      value={{ refetchIncentiveData, refetchPoolData, refetchGhoData }}
    >
      {children}
    </BackgroundDataProviderContext.Provider>
  );
};

export const useBackgroundDataProvider = () => useContext(BackgroundDataProviderContext);
