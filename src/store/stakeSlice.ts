import { UiStakeDataProvider } from '@aave/contract-helpers';
import { getStakeConfig } from 'src/ui-config/stakeConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';
import { RootStore } from './root';

export type C_StakeGeneralUiDataQuery = {
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

export type C_StakeUserUiDataQuery = {
  __typename?: 'Query';
  stakeUserUIData: {
    __typename?: 'StakeUserUIData';
    usdPriceEth: string;
    aave: {
      __typename?: 'StakeUserData';
      stakeTokenUserBalance: string;
      underlyingTokenUserBalance: string;
      userCooldown: number;
      userIncentivesToClaim: string;
      userPermitNonce: string;
    };
    bpt: {
      __typename?: 'StakeUserData';
      stakeTokenUserBalance: string;
      underlyingTokenUserBalance: string;
      userCooldown: number;
      userIncentivesToClaim: string;
      userPermitNonce: string;
    };
  };
};

export interface StakeSlice {
  refetchStakeData: () => void;
  stakeUserResult?: C_StakeUserUiDataQuery;
  stakeGeneralResult?: C_StakeGeneralUiDataQuery;
}

export const createStakeSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  StakeSlice
> = (set, get) => ({
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
      console.log('error fetching general statke data');
    }
  },
});
