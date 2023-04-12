import {
  EthereumTransactionTypeExtended,
  StakingService,
  UiStakeDataProvider,
} from '@aave/contract-helpers';
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

export type StakeGeneralUiData = {
  usdPriceEth: string;
  aave: {
    stakeTokenTotalSupply: string;
    stakeCooldownSeconds: number;
    stakeUnstakeWindow: number;
    stakeTokenPriceEth: string;
    rewardTokenPriceEth: string;
    stakeApy: string;
    distributionPerSecond: string;
    distributionEnd: string;
  };
  bpt: {
    stakeTokenTotalSupply: string;
    stakeCooldownSeconds: number;
    stakeUnstakeWindow: number;
    stakeTokenPriceEth: string;
    rewardTokenPriceEth: string;
    stakeApy: string;
    distributionPerSecond: string;
    distributionEnd: string;
  };
};

export type StakeUserUiData = {
  usdPriceEth: string;
  aave: {
    stakeTokenUserBalance: string;
    underlyingTokenUserBalance: string;
    userCooldown: number;
    userIncentivesToClaim: string;
    userPermitNonce: string;
  };
  bpt: {
    stakeTokenUserBalance: string;
    underlyingTokenUserBalance: string;
    userCooldown: number;
    userIncentivesToClaim: string;
    userPermitNonce: string;
  };
};

export interface StakeSlice {
  refetchStakeData: () => Promise<void>;
  stakeDataLoading: boolean;
  stakeUserResult?: StakeUserUiData;
  stakeGeneralResult?: StakeGeneralUiData;
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
  getStakeConfig: () => StakeConfig;

  redeem: (token: string) => (amount: string) => Promise<EthereumTransactionTypeExtended[]>;
}

export const createStakeSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  StakeSlice
> = (set, get) => {
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
    stakeDataLoading: true,
    refetchStakeData: async () => {
      const uiStakeDataProvider = new UiStakeDataProvider({
        provider: getCorrectProvider(),
        uiStakeDataProvider: getCurrentStakeConfig().stakeDataProvider,
      });
      const promises: Promise<void>[] = [];
      try {
        promises.push(
          uiStakeDataProvider
            .getGeneralStakeUIDataHumanized()
            .then((generalStakeData) => set({ stakeGeneralResult: generalStakeData }))
        );
        if (get().account) {
          promises.push(
            uiStakeDataProvider
              .getUserStakeUIDataHumanized({
                user: get().account,
              })
              .then((userStakeData) => {
                set({
                  stakeUserResult: userStakeData,
                });
              })
          );
        }
        await Promise.all(promises);
      } catch (e) {
        console.log('error fetching general stake data');
      }
      set({ stakeDataLoading: false });
    },
    signStakingApproval({ token, amount }) {
      const provider = getCorrectProvider();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[token].TOKEN_STAKING,
        STAKING_HELPER_ADDRESS: getCurrentStakeConfig().tokens[token].STAKING_HELPER,
      });
      const currentUser = get().account;
      return service.signStaking(currentUser, amount);
    },
    getStakeConfig() {
      const stakeConfig = getCurrentStakeConfig();

      return stakeConfig;
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
    redeem(tokenName) {
      const provider = getCorrectProvider();
      const currentAccount = get().account;
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: getCurrentStakeConfig().tokens[tokenName].TOKEN_STAKING,
      });
      return (amount) => service.redeem(currentAccount, amount);
    },
  };
};
