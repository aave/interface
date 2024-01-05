import {
  ERC20_2612Service,
  EthereumTransactionTypeExtended,
  GovDelegate,
  GovDelegateByType,
  GovernancePowerDelegationTokenService,
} from '@aave/contract-helpers';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface GovernanceSlice {
  delegate: (args: Omit<GovDelegate, 'user'>) => Promise<EthereumTransactionTypeExtended[]>;
  delegateByType: (
    args: Omit<GovDelegateByType, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  getTokenNonce: (user: string, token: string) => Promise<number>;
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
      currentNetworkConfig.underlyingChainId === governanceV3Config.coreChainId;
    return isStakeFork ? get().jsonRpcProvider() : getProvider(governanceV3Config.coreChainId);
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
    getTokenNonce: async (user: string, token: string) => {
      const service = new ERC20_2612Service(getCorrectProvider());
      const nonce = await service.getNonce({ token, owner: user });
      return nonce || 0;
    },
  };
};
