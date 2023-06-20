import { EthereumTransactionTypeExtended, StakingService } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import {
  goerliStakeConfig,
  prodStakeConfig,
  sepoliaStakeConfig,
  StakeConfig,
} from 'src/ui-config/stakeConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface StakeSlice {
  signStakingApproval: (args: { token: string; amount: string }) => Promise<string>;
  stakeWithPermit: (args: {
    token: string;
    amount: string;
    signature: SignatureLike;
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
  getStakeConfig: () => StakeConfig;

  redeem: (token: string) => (amount: string) => Promise<EthereumTransactionTypeExtended[]>;
}

export const createStakeSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  StakeSlice
> = (_, get) => {
  function getCurrentStakeConfig() {
    const currentNetworkConfig = get().currentNetworkConfig;

    if (currentNetworkConfig.name === 'Ethereum Sepolia') {
      return sepoliaStakeConfig;
    }

    if (currentNetworkConfig.name === 'Ethereum Görli') {
      return goerliStakeConfig;
    }

    return prodStakeConfig;
  }
  function getCorrectProvider() {
    const currentNetworkConfig = get().currentNetworkConfig;
    const isStakeFork =
      currentNetworkConfig.isFork &&
      currentNetworkConfig.underlyingChainId === getCurrentStakeConfig().chainId;

    return isStakeFork ? get().jsonRpcProvider() : getProvider(getCurrentStakeConfig().chainId);
  }
  return {
    signStakingApproval({ token, amount }) {
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[token].TOKEN_STAKING,
        STAKING_HELPER_ADDRESS: getCurrentStakeConfig().tokens[token].STAKING_HELPER,
      });
      const currentUser = get().account;
      return service.signStaking(currentUser, amount);
    },
    stakeWithPermit({ token, amount, signature }) {
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[token].TOKEN_STAKING,
        STAKING_HELPER_ADDRESS: getCurrentStakeConfig().tokens[token].STAKING_HELPER,
      });
      const currentUser = get().account;
      return service.stakeWithPermit(currentUser, amount, signature);
    },
    stake({ token, amount, onBehalfOf }) {
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[token].TOKEN_STAKING,
      });
      const currentUser = get().account;
      return service.stake(currentUser, amount, onBehalfOf);
    },
    async cooldown(tokenName) {
      const provider = getCorrectProvider();
      const currentAccount = get().account;
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[tokenName].TOKEN_STAKING,
      });
      return service.cooldown(currentAccount);
    },
    claimStakeRewards({ token, amount }) {
      const currentAccount = get().account;
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[token].TOKEN_STAKING,
      });
      return service.claimRewards(currentAccount, amount);
    },
    claimRewardsAndStake({ token, amount }) {
      const currentAccount = get().account;
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[token].TOKEN_STAKING,
      });
      return service.claimRewardsAndStake(currentAccount, amount);
    },
    redeem(tokenName) {
      const provider = getCorrectProvider();
      const currentAccount = get().account;
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[tokenName].TOKEN_STAKING,
      });
      return (amount) => service.redeem(currentAccount, amount);
    },
    getStakeConfig() {
      const stakeConfig = getCurrentStakeConfig();
      return stakeConfig;
    },
  };
};
