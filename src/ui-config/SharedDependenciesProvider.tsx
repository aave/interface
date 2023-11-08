import { createContext, useContext } from 'react';
import { GovernanceService } from 'src/services/GovernanceService';
import { UiGhoService } from 'src/services/UiGhoService';
import { UiIncentivesService } from 'src/services/UIIncentivesService';
import { UiPoolService } from 'src/services/UIPoolService';
import { UiStakeDataService } from 'src/services/UiStakeDataService';
import { WalletBalanceService } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { governanceConfig } from './governanceConfig';
import { stakeConfig } from './stakeConfig';

interface SharedDependenciesContext {
  governanceService: GovernanceService;
  governanceWalletBalanceService: WalletBalanceService;
  poolTokensBalanceService: WalletBalanceService;
  uiStakeDataService: UiStakeDataService;
  uiIncentivesService: UiIncentivesService;
  uiPoolService: UiPoolService;
  uiGhoService: UiGhoService;
}

const SharedDependenciesContext = createContext<SharedDependenciesContext | null>(null);

export const SharedDependenciesProvider: React.FC = ({ children }) => {
  const currentNetworkConfig = useRootStore((state) => state.currentNetworkConfig);
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const isGovernanceFork =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId;
  const isStakeFork =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId;

  const governanceChainId = isGovernanceFork ? currentMarketData.chainId : governanceConfig.chainId;
  const stakingChainId = isStakeFork ? currentMarketData.chainId : stakeConfig.chainId;

  // providers
  const currentProvider = getProvider(currentMarketData.chainId);
  const governanceProvider = isGovernanceFork
    ? currentProvider
    : getProvider(governanceConfig.chainId);
  const stakeProvider = isStakeFork ? currentProvider : getProvider(stakeConfig.chainId);

  // services
  const governanceService = new GovernanceService(governanceProvider, governanceChainId);

  const getGovernanceProvider = () => {
    return isGovernanceFork ? currentProvider : getProvider(governanceConfig.chainId);
  };

  const governanceWalletBalanceService = new WalletBalanceService(getGovernanceProvider);
  const poolTokensBalanceService = new WalletBalanceService(getProvider);
  const uiStakeDataService = new UiStakeDataService(
    stakeProvider,
    stakeConfig.stakeDataProvider,
    stakingChainId
  );

  const uiPoolService = new UiPoolService(getProvider);
  const uiIncentivesService = new UiIncentivesService(getProvider);

  const uiGhoService = new UiGhoService(getProvider);

  return (
    <SharedDependenciesContext.Provider
      value={{
        governanceService,
        governanceWalletBalanceService,
        poolTokensBalanceService,
        uiStakeDataService,
        uiPoolService,
        uiIncentivesService,
        uiGhoService,
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
