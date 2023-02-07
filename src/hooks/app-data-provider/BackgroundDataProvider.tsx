import React, { useContext } from 'react';
import {
  useGhoDataSubscription,
  useIncentiveDataSubscription,
  usePoolDataSubscription,
  useStakeDataSubscription,
  useWalletBalancesSubscription,
} from 'src/store/root';

interface BackgroundDataProviderContextType {
  refetchGhoData: () => Promise<void>;
  refetchWalletBalances: () => Promise<void>;
  refetchIncentiveData?: () => Promise<void>;
  refetchPoolData?: () => Promise<void> | Promise<void[]>;
  refetchStakeData: () => Promise<void>;
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
  // Instantiate Zustand store subscribers
  const refetchWalletBalances = useWalletBalancesSubscription();
  const refetchPoolData = usePoolDataSubscription();
  const refetchIncentiveData = useIncentiveDataSubscription();
  const refetchGhoData = useGhoDataSubscription();
  const refetchStakeData = useStakeDataSubscription();
  return (
    <BackgroundDataProviderContext.Provider
      value={{
        refetchWalletBalances,
        refetchIncentiveData,
        refetchPoolData,
        refetchGhoData,
        refetchStakeData,
      }}
    >
      {children}
    </BackgroundDataProviderContext.Provider>
  );
};

export const useBackgroundDataProvider = () => useContext(BackgroundDataProviderContext);
