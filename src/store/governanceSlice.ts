import {
  AaveGovernanceService,
  EthereumTransactionTypeExtended,
  GovDelegate,
  GovDelegateByType,
  GovernancePowerDelegationTokenService,
} from '@aave/contract-helpers';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface GovernanceSlice {
  delegate: (args: Omit<GovDelegate, 'user'>) => Promise<EthereumTransactionTypeExtended[]>;
  delegateByType: (
    args: Omit<GovDelegateByType, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  submitVote: AaveGovernanceService['submitVote'];
}

export const createGovernanceSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  GovernanceSlice
> = (_, get) => {
  function getCorrectProvider() {
    const currentNetworkConfig = get().currentNetworkConfig;
    const isStakeFork =
      currentNetworkConfig.isFork &&
      currentNetworkConfig.underlyingChainId === governanceConfig?.chainId;
    return isStakeFork ? get().jsonRpcProvider() : getProvider(governanceConfig.chainId);
  }
  return {
    delegateByType: (args) => {
      const service = new GovernancePowerDelegationTokenService(getCorrectProvider());
      const user = get().account;
      return service.delegateByType({ ...args, user });
    },
    delegate: (args) => {
      const service = new GovernancePowerDelegationTokenService(getCorrectProvider());
      const user = get().account;
      return service.delegate({ ...args, user });
    },
    submitVote: (args) => {
      const governanceService = new AaveGovernanceService(getCorrectProvider(), {
        GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
        GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
        ipfsGateway: governanceConfig.ipfsGateway,
      });
      return governanceService.submitVote(args);
    },
  };
};
