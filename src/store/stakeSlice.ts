import { StakingService, UiStakeDataProvider } from '@aave/contract-helpers';
import { getStakeConfig } from 'src/ui-config/stakeConfig';
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
  stake: (token: string) => StakingService['stake'];
  cooldown: (token: string) => StakingService['cooldown'];
  claimRewards: (token: string) => StakingService['claimRewards'];
  redeem: (token: string) => StakingService['redeem'];
}

export const createStakeSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  StakeSlice
> = (set, get) => {
  function getCorrectProvider() {
    const stakeConfig = getStakeConfig();
    const currentNetworkConfig = get().currentNetworkConfig;
    const isStakeFork =
      currentNetworkConfig.isFork &&
      currentNetworkConfig.underlyingChainId === stakeConfig?.chainId;
    return isStakeFork ? get().jsonRpcProvider() : getProvider(stakeConfig.chainId);
  }
  return {
    stakeDataLoading: true,
    refetchStakeData: async () => {
      const stakeConfig = getStakeConfig();
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
              .then((userStakeData) => set({ stakeUserResult: userStakeData }))
          );
        }
        await Promise.all(promises);
      } catch (e) {
        console.log('error fetching general stake data');
      }
      set({ stakeDataLoading: false });
    },
    stake(tokenName) {
      const provider = getCorrectProvider();
      const stakeConfig = getStakeConfig();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[tokenName].TOKEN_STAKING,
      });
      return (...args) => service.stake(...args);
    },
    cooldown(tokenName) {
      const provider = getCorrectProvider();
      const stakeConfig = getStakeConfig();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[tokenName].TOKEN_STAKING,
      });
      return (...args) => service.cooldown(...args);
    },
    claimRewards(tokenName) {
      const provider = getCorrectProvider();
      const stakeConfig = getStakeConfig();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[tokenName].TOKEN_STAKING,
      });
      return (...args) => service.claimRewards(...args);
    },
    redeem(tokenName) {
      const provider = getCorrectProvider();
      const stakeConfig = getStakeConfig();
      const service = new StakingService(provider, {
        TOKEN_STAKING_ADDRESS: stakeConfig.tokens[tokenName].TOKEN_STAKING,
      });
      return (...args) => service.redeem(...args);
    },
  };
};
