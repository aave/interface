import { UiStakeDataProvider } from '@aave/contract-helpers';
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
}

export const createStakeSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  StakeSlice
> = (set, get) => ({
  stakeDataLoading: true,
  refetchStakeData: async () => {
    const stakeConfig = getStakeConfig();
    const currentNetworkConfig = get().currentNetworkConfig;
    const isStakeFork =
      currentNetworkConfig.isFork &&
      currentNetworkConfig.underlyingChainId === stakeConfig?.chainId;
    const rpcProvider = isStakeFork ? get().jsonRpcProvider() : getProvider(stakeConfig.chainId);
    const uiStakeDataProvider = new UiStakeDataProvider({
      provider: rpcProvider,
      uiStakeDataProvider: stakeConfig.stakeDataProvider,
    });
    try {
      const generalStakeData = await uiStakeDataProvider.getGeneralStakeUIDataHumanized();
      set({ stakeGeneralResult: generalStakeData });
    } catch (e) {
      console.log('error fetching general stake data');
    }
    if (get().account) {
      try {
        const userStakeData = await uiStakeDataProvider.getUserStakeUIDataHumanized({
          user: get().account,
        });
        set({ stakeUserResult: userStakeData });
      } catch (e) {
        console.log('error fetching user stake data');
      }
    }
    set({ stakeDataLoading: false });
  },
});
