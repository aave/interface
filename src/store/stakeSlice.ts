import {
  EthereumTransactionTypeExtended,
  StakingService,
  StakingServiceV3,
} from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface StakeSlice {
  signStakingApproval: (args: {
    token: string;
    amount: string;
    deadline: string;
  }) => Promise<string>;
  stakeWithPermit: (args: {
    token: string;
    amount: string;
    signature: SignatureLike;
    deadline: string;
  }) => Promise<EthereumTransactionTypeExtended[]>;
  stake: (args: {
    token: string;
    amount: string;
    onBehalfOf?: string;
  }) => Promise<EthereumTransactionTypeExtended[]>;
  cooldown: (token: string) => Promise<EthereumTransactionTypeExtended[]>;
  claimStakeRewards: (args: {
    token: string;
    amount: string;
  }) => Promise<EthereumTransactionTypeExtended[]>;
  claimRewardsAndStake: (args: {
    token: string;
    amount: string;
  }) => Promise<EthereumTransactionTypeExtended[]>;
  redeem: (token: string) => (amount: string) => Promise<EthereumTransactionTypeExtended[]>;
}

export const createStakeSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  StakeSlice
> = (_, get) => {
  function getCorrectProvider() {
    const currentNetworkConfig = get().currentNetworkConfig;
    const isStakeFork =
      currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId;

    return isStakeFork ? get().jsonRpcProvider() : getProvider(stakeConfig.chainId);
  }
  function getStakingService(stakeToken: string) {
    const provider = getCorrectProvider();
    const tokenStakingAddress = stakeConfig.tokens[stakeToken].TOKEN_STAKING;
    if (stakeToken === 'aave' || stakeToken === 'bpt') {
      return new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: tokenStakingAddress,
      });
    } else {
      return new StakingServiceV3(provider, {
        TOKEN_STAKING_ADDRESS: tokenStakingAddress,
      });
    }
  }
  return {
    signStakingApproval({ token, amount, deadline }) {
      const service = getStakingService(token);
      const currentUser = get().account;
      return service.signStaking(currentUser, amount, deadline);
    },
    stakeWithPermit({ token, amount, signature, deadline }) {
      const service = getStakingService(token);
      const currentUser = get().account;
      return service.stakeWithPermit(currentUser, amount, signature, deadline);
    },
    stake({ token, amount, onBehalfOf }) {
      const service = getStakingService(token);
      const currentUser = get().account;
      return service.stake(currentUser, amount, onBehalfOf);
    },
    async cooldown(tokenName) {
      const service = getStakingService(tokenName);
      const currentAccount = get().account;
      return service.cooldown(currentAccount);
    },
    claimStakeRewards({ token, amount }) {
      const service = getStakingService(token);
      const currentAccount = get().account;
      return service.claimRewards(currentAccount, amount);
    },
    claimRewardsAndStake({ token, amount }) {
      // Note: only available for stkAAVE
      const currentAccount = get().account;
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[token].TOKEN_STAKING,
      });
      return service.claimRewardsAndStake(currentAccount, amount);
    },
    redeem(tokenName) {
      const service = getStakingService(tokenName);
      const currentAccount = get().account;
      return (amount) => service.redeem(currentAccount, amount);
    },
  };
};
