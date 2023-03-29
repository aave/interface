import { createContext, useContext } from 'react';
import { GovernanceService } from 'src/services/GovernanceService';
import { WalletBalanceService } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { governanceConfig } from './governanceConfig';

interface SharedDependenciesContext {
  governanceService: GovernanceService;
  governanceTokensBalanceService: WalletBalanceService;
  poolTokensBalanceService: WalletBalanceService;
}

const SharedDependenciesContext = createContext<SharedDependenciesContext | null>(null);

export const SharedDependenciesProvider: React.FC = ({ children }) => {
  const currentNetworkConfig = useRootStore((state) => state.currentNetworkConfig);
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const getJsonRpcProvider = useRootStore((state) => state.jsonRpcProvider);
  const isGovernanceFork =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId;
  const currentProvider = getJsonRpcProvider();
  const governanceProvider = isGovernanceFork
    ? currentProvider
    : getProvider(governanceConfig.chainId);

  // services

  const governanceService = new GovernanceService(governanceProvider);
  const governanceTokensBalanceService = new WalletBalanceService(
    governanceProvider,
    governanceConfig.walletBalanceProvider
  );
  const poolTokensBalanceService = new WalletBalanceService(
    currentProvider,
    currentMarketData.addresses.WALLET_BALANCE_PROVIDER
  );
  return (
    <SharedDependenciesContext.Provider
      value={{ governanceService, governanceTokensBalanceService, poolTokensBalanceService }}
    >
      {children}
    </SharedDependenciesContext.Provider>
  );
};

export const useSharedDependencies = () => {
  const context = useContext(SharedDependenciesContext);
  invariant(context, 'Component should be wrapper inside a <SharedDependenciesProvider />');
  return context;
};
