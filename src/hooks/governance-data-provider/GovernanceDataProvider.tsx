import React, { useContext } from 'react';
import { useGovernanceDataSubscription } from 'src/store/root';

interface GovernanceDataProviderContextType {}

const GovernanceDataProviderContext = React.createContext<GovernanceDataProviderContextType>(
  {} as GovernanceDataProviderContextType
);

/**
 * Naive provider that subscribes to different data sources to update the apollo cache.
 * @param param0
 * @returns
 */
export const GovernanceDataProvider: React.FC = ({ children }) => {
  useGovernanceDataSubscription();
  return (
    <GovernanceDataProviderContext.Provider value={{}}>
      {children}
    </GovernanceDataProviderContext.Provider>
  );
};

export const useGovernanceDataProvider = () => useContext(GovernanceDataProviderContext);
