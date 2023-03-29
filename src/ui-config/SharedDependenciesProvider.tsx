import { createContext, useContext } from 'react';
import { GovernanceService } from 'src/services/GovernanceService';
import { UiStakeDataService } from 'src/Services/UiStakeDataService';
import { WalletBalanceService } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { governanceConfig } from './governanceConfig';
import { stakeConfig } from './stakeConfig';

interface SharedDependenciesContext {
  governanceService: GovernanceService;
  governanceTokensBalanceService: WalletBalanceService;
  poolTokensBalanceService: WalletBalanceService;
  uiStakeDataService: UiStakeDataService;
}

const SharedDependenciesContext = createContext<SharedDependenciesContext | null>(null);

export const SharedDependenciesProvider: React.FC = ({ children }) => {
  const currentNetworkConfig = useRootStore((state) => state.currentNetworkConfig);
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const getJsonRpcProvider = useRootStore((state) => state.jsonRpcProvider);
  const isGovernanceFork =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId;
  const isStakeFork =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId;

  // providers

  const currentProvider = getJsonRpcProvider();
  const governanceProvider = isGovernanceFork
    ? currentProvider
    : getProvider(governanceConfig.chainId);
  const stakeProvider = isStakeFork ? currentProvider : getProvider(stakeConfig.chainId);

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
  const uiStakeDataService = new UiStakeDataService(stakeProvider, stakeConfig.stakeDataProvider);

  return (
    <SharedDependenciesContext.Provider
      value={{
        governanceService,
        governanceTokensBalanceService,
        poolTokensBalanceService,
        uiStakeDataService,
      }}
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
