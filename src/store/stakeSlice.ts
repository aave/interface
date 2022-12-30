import {
  EthereumTransactionTypeExtended,
  StakingService,
  UiStakeDataProvider,
} from '@aave/contract-helpers';
import { stakeConfig } from 'src/ui-config/stakeConfig';
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
  redeem: (token: string) => (amount: string) => Promise<EthereumTransactionTypeExtended[]>;
}

export const createStakeSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  StakeSlice
> = (set, get) => {
  function getCorrectProvider() {
    const currentNetworkConfig = get().currentNetworkConfig;
    const isStakeFork =
      currentNetworkConfig.isFork &&
      currentNetworkConfig.underlyingChainId === stakeConfig?.chainId;

    return isStakeFork ? get().jsonRpcProvider() : getProvider(stakeConfig.chainId);
  }
  return {
    stakeDataLoading: true,
    refetchStakeData: async () => {
      const uiStakeDataProvider = new UiStakeDataProvider({
        provider: getCorrectProvider(),
        uiStakeDataProvider: stakeConfig.stakeDataProvider,
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
