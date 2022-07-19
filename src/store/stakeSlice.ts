import { StateCreator } from 'zustand';
import { RootStore } from './root';

export type C_StakeGeneralUiDataQuery = {
  __typename?: 'Query';
  stakeGeneralUIData: {
    __typename?: 'StakeGeneralUIData';
    usdPriceEth: string;
    aave: {
      __typename?: 'StakeGeneralData';
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
      __typename?: 'StakeGeneralData';
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
  test: number;
}

export const createStakeSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  StakeSlice
> = (set) => ({
  refetchStakeData: () => {
    set((state) => ({ test: state.test + 3 }));
  },
  test: 0,
});
