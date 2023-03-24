import { createContext, useContext } from 'react';
import { GovernanceService } from 'src/Services/GovernanceService';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { governanceConfig } from './governanceConfig';

interface SharedDependenciesContext {
  governanceService: GovernanceService;
}

const SharedDependenciesContext = createContext<SharedDependenciesContext | null>(null);

export const SharedDependenciesProvider: React.FC = ({ children }) => {
  const currentNetworkConfig = useRootStore((state) => state.currentNetworkConfig);
  const getJsonRpcProvider = useRootStore((state) => state.jsonRpcProvider);
  const isStakeFork =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId;
  const governanceProvider = isStakeFork
    ? getJsonRpcProvider()
    : getProvider(governanceConfig.chainId);
  const governanceService = new GovernanceService(governanceProvider);
  return (
    <SharedDependenciesContext.Provider value={{ governanceService }}>
      {children}
    </SharedDependenciesContext.Provider>
  );
};

export const useSharedDependencies = () => {
  const context = useContext(SharedDependenciesContext);
  invariant(context, 'Component should be wrapper inside a <SharedDependenciesProvider />');
  return context;
};
