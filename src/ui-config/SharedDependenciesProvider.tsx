import { createContext, useContext } from 'react';
import { GovernanceService } from 'src/services/GovernanceService';
import { UiGhoService } from 'src/services/UiGhoService';
import { UiIncentivesService } from 'src/services/UIIncentivesService';
import { UiPoolService } from 'src/services/UIPoolService';
import { UiStakeDataService } from 'src/services/UiStakeDataService';
import { WalletBalanceService } from 'src/services/WalletBalanceService';
import { getNetworkConfig, getProvider } from 'src/utils/marketsAndNetworksConfig';
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
  // providers

  const getGovernanceProvider = (chainId: number) => {
    const networkConfig = getNetworkConfig(chainId);
    const isGovernanceFork =
      networkConfig.isFork && networkConfig.underlyingChainId === governanceConfig.chainId;
    return isGovernanceFork ? getProvider(chainId) : getProvider(governanceConfig.chainId);
  };
  const getStakeProvider = (chainId: number) => {
    const networkConfig = getNetworkConfig(chainId);
    const isStakeFork =
      networkConfig.isFork && networkConfig.underlyingChainId === stakeConfig.chainId;
    return isStakeFork ? getProvider(chainId) : getProvider(stakeConfig.chainId);
  };

  // services

  const governanceService = new GovernanceService(getGovernanceProvider);

  const governanceWalletBalanceService = new WalletBalanceService(getGovernanceProvider);
  const poolTokensBalanceService = new WalletBalanceService(getProvider);
  const uiStakeDataService = new UiStakeDataService(getStakeProvider);

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
