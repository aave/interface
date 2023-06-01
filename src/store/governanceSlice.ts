import {
  AaveGovernanceService,
  ERC20_2612Service,
  EthereumTransactionTypeExtended,
  GovDelegate,
  GovDelegateByType,
  GovDelegateTokensBySig,
  GovDelegateTokensByTypeBySig,
  GovernancePowerDelegationTokenService,
  GovPrepareDelegateSig,
  GovPrepareDelegateSigByType,
} from '@aave/contract-helpers';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface GovernanceSlice {
  delegate: (args: Omit<GovDelegate, 'user'>) => Promise<EthereumTransactionTypeExtended[]>;
  prepareDelegateSignature: (args: GovPrepareDelegateSig) => Promise<string>;
  prepareDelegateByTypeSignature: (args: GovPrepareDelegateSigByType) => Promise<string>;
  delegateByType: (
    args: Omit<GovDelegateByType, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  submitVote: AaveGovernanceService['submitVote'];
  getTokenNonce: (user: string, token: string) => Promise<number>;
  delegateTokensBySig: (args: GovDelegateTokensBySig) => Promise<EthereumTransactionTypeExtended[]>;
  delegateTokensByTypeBySig: (
    args: GovDelegateTokensByTypeBySig
  ) => Promise<EthereumTransactionTypeExtended[]>;
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
    prepareDelegateByTypeSignature: (args) => {
      const service = new GovernancePowerDelegationTokenService(getCorrectProvider());
      return service.prepareDelegateByTypeSignature(args);
    },
    prepareDelegateSignature: (args) => {
      const service = new GovernancePowerDelegationTokenService(getCorrectProvider());
      return service.prepareDelegateSignature(args);
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
    getTokenNonce: async (user: string, token: string) => {
      const service = new ERC20_2612Service(getCorrectProvider());
      const nonce = await service.getNonce({ token, owner: user });
      return nonce || 0;
    },
    delegateTokensBySig: async (args) => {
      const governanceService = new AaveGovernanceService(getCorrectProvider(), {
        GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
        GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
        ipfsGateway: governanceConfig.ipfsGateway,
      });
      return governanceService.delegateTokensBySig(args);
    },
    delegateTokensByTypeBySig: async (args) => {
      const governanceService = new AaveGovernanceService(getCorrectProvider(), {
        GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
        GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
        ipfsGateway: governanceConfig.ipfsGateway,
      });
      return governanceService.delegateTokensByTypeBySig(args);
    },
  };
};
