import { AaveGovernanceService, GovernancePowerDelegationToken } from '@aave/contract-helpers';
import React, { useContext } from 'react';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { _useGovernanceDataRPC } from './_useGovernanceDataRPC';

interface GovernanceDataProviderContextType {
  governanceService: AaveGovernanceService;
  governanceDelegationService: GovernancePowerDelegationToken;
}

const GovernanceDataProviderContext = React.createContext<GovernanceDataProviderContextType>(
  {} as GovernanceDataProviderContextType
);

/**
 * Naive provider that subscribes to different data sources to update the apollo cache.
 * @param param0
 * @returns
 */
export const GovernanceDataProvider: React.FC = ({ children }) => {
  if (!governanceConfig) return <>{children}</>;

  const { governanceService, governanceDelegationService } = _useGovernanceDataRPC({
    governanceConfig,
  });
  return (
    <GovernanceDataProviderContext.Provider
      value={{ governanceService, governanceDelegationService }}
    >
      {children}
    </GovernanceDataProviderContext.Provider>
  );
};

export const useGovernanceDataProvider = () => useContext(GovernanceDataProviderContext);
