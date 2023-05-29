import { EthereumTransactionTypeExtended, StakingService } from '@aave/contract-helpers';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface StakeSlice {
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
  claimStakeRewardsRestake: (args: {
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
      currentNetworkConfig.isFork &&
      currentNetworkConfig.underlyingChainId === stakeConfig?.chainId;
    return isStakeFork ? get().jsonRpcProvider() : getProvider(stakeConfig.chainId);
  }
  return {
    stake({ token, amount, onBehalfOf }) {
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[token].TOKEN_STAKING,
      });
      const currentUser = get().account;
      return service.stake(currentUser, amount, onBehalfOf);
    },
    async cooldown(tokenName) {
      const provider = getCorrectProvider();
      const currentAccount = get().account;
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[tokenName].TOKEN_STAKING,
      });
      return service.cooldown(currentAccount);
    },
    claimStakeRewards({ token, amount }) {
      const currentAccount = get().account;
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[token].TOKEN_STAKING,
      });
      return service.claimRewards(currentAccount, amount);
    },
    claimStakeRewardsRestake({ token, amount }) {
      const currentAccount = get().account;
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[token].TOKEN_STAKING,
      });
      return service.claimRewards(currentAccount, amount);
    },
    redeem(tokenName) {
      const provider = getCorrectProvider();
      const currentAccount = get().account;
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[tokenName].TOKEN_STAKING,
      });
      return (amount) => service.redeem(currentAccount, amount);
    },
  };
};
