import { createContext, useContext } from 'react';
import { ApprovedAmountService } from 'src/services/ApprovedAmountService';
import { DelegationTokenService } from 'src/services/DelegationTokenService';
import { ERC20Service } from 'src/services/Erc20Service';
import { GovernanceService } from 'src/services/GovernanceService';
import { GovernanceV3Service } from 'src/services/GovernanceV3Service';
import { MigrationService } from 'src/services/MigrationService';
import { StkAbptMigrationService } from 'src/services/StkAbptMigrationService';
import { TokenWrapperService } from 'src/services/TokenWrapperService';
import { UiGhoService } from 'src/services/UiGhoService';
import { UiIncentivesService } from 'src/services/UIIncentivesService';
import { UiPoolService } from 'src/services/UIPoolService';
import { UiStakeDataService } from 'src/services/UiStakeDataService';
import { VotingMachineService } from 'src/services/VotingMachineService';
import { WalletBalanceService } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig, getProvider } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { governanceV3Config } from './governanceConfig';
import { stakeConfig } from './stakeConfig';

interface SharedDependenciesContext {
  governanceService: GovernanceService;
  governanceV3Service: GovernanceV3Service;
  votingMachineSerivce: VotingMachineService;
  governanceWalletBalanceService: WalletBalanceService;
  poolTokensBalanceService: WalletBalanceService;
  uiStakeDataService: UiStakeDataService;
  approvedAmountService: ApprovedAmountService;
  uiIncentivesService: UiIncentivesService;
  uiPoolService: UiPoolService;
  tokenWrapperService: TokenWrapperService;
  uiGhoService: UiGhoService;
  delegationTokenService: DelegationTokenService;
  stkAbptMigrationService: StkAbptMigrationService;
  migrationService: MigrationService;
  erc20Service: ERC20Service;
}

const SharedDependenciesContext = createContext<SharedDependenciesContext | null>(null);

export const SharedDependenciesProvider: React.FC = ({ children }) => {
  const currentMarketData = useRootStore((state) => state.currentMarketData);

  const getGovernanceProvider = (chainId: number) => {
    const networkConfig = getNetworkConfig(chainId);
    const isGovernanceFork =
      networkConfig.isFork && networkConfig.underlyingChainId === governanceV3Config.coreChainId;
    return isGovernanceFork ? getProvider(chainId) : getProvider(governanceV3Config.coreChainId);
  };
  const getStakeProvider = (chainId: number) => {
    const networkConfig = getNetworkConfig(chainId);
    const isStakeFork =
      networkConfig.isFork && networkConfig.underlyingChainId === stakeConfig.chainId;
    return isStakeFork ? getProvider(chainId) : getProvider(stakeConfig.chainId);
  };

  // services
  const governanceService = new GovernanceService(getGovernanceProvider);
  const governanceV3Service = new GovernanceV3Service();
  const votingMachineSerivce = new VotingMachineService();
  const governanceWalletBalanceService = new WalletBalanceService(getGovernanceProvider);
  const poolTokensBalanceService = new WalletBalanceService(getProvider);
  const uiStakeDataService = new UiStakeDataService(getStakeProvider);
  const approvedAmountService = new ApprovedAmountService(getProvider);
  const delegationTokenService = new DelegationTokenService(getGovernanceProvider);
  const stkAbptMigrationService = new StkAbptMigrationService();
  const migrationService = new MigrationService(getProvider);

  const uiPoolService = new UiPoolService(getProvider);
  const uiIncentivesService = new UiIncentivesService(getProvider);
  const tokenWrapperService = new TokenWrapperService(
    currentMarketData.chainId,
    getProvider(currentMarketData.chainId)
  );
  const erc20Service = new ERC20Service(getProvider);

  const uiGhoService = new UiGhoService(getProvider);

  return (
    <SharedDependenciesContext.Provider
      value={{
        governanceService,
        governanceV3Service,
        votingMachineSerivce,
        governanceWalletBalanceService,
        poolTokensBalanceService,
        uiStakeDataService,
        approvedAmountService,
        uiPoolService,
        uiIncentivesService,
        tokenWrapperService,
        uiGhoService,
        delegationTokenService,
        stkAbptMigrationService,
        migrationService,
        erc20Service,
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
