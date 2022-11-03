import {
  GhoDiscountRateStrategyService,
  GhoVariableDebtTokenService,
} from '@aave/contract-helpers';
import { BigNumber, BigNumberish } from 'ethers';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface GhoSlice {
  ghoDiscountRateStrategyAddress: string;
  ghoDiscountRate: BigNumberish;
  ghoDiscountedPerToken: BigNumber;
  ghoDiscountableAmount: BigNumber;
  ghoUpdateDiscountRate: () => Promise<void>;
  ghoCalculateDiscountRate: (
    ghoDebtTokenBalance: BigNumberish,
    stakedAaveBalance: BigNumberish
  ) => Promise<BigNumber>;
  refreshGhoData: () => Promise<void>;
}

export const createGhoSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  GhoSlice
> = (set, get) => {
  return {
    ghoDiscountableAmount: BigNumber.from(0),
    ghoDiscountedPerToken: BigNumber.from(0),
    ghoDiscountRateStrategyAddress: '0x91A534290666B817D986Ef70089f8Cc5bc241C34', // TODO: remove this once utils is updated to only take debt token contract
    ghoDiscountRate: BigNumber.from(0),
    ghoCalculateDiscountRate: async (
      ghoDebtTokenBalance: BigNumberish,
      stakedAaveBalance: BigNumberish
    ) => {
      const provider = get().jsonRpcProvider();
      const address = get().ghoDiscountRateStrategyAddress;
      const ghoDiscountRateService = new GhoDiscountRateStrategyService(provider, address);
      return await ghoDiscountRateService.calculateDiscountRate(
        ghoDebtTokenBalance,
        stakedAaveBalance
      );
    },
    ghoUpdateDiscountRate: async () => {
      const provider = get().jsonRpcProvider();
      const address = get().ghoDiscountRateStrategyAddress;
      const ghoDebtTokenService = new GhoVariableDebtTokenService(provider, address);

      const rate = await ghoDebtTokenService.getUserDiscountPercent(get().account);
      set({ ghoDiscountRate: rate });
    },
    refreshGhoData: async () => {
      const provider = get().jsonRpcProvider();
      const address = get().ghoDiscountRateStrategyAddress;
      const ghoDiscountRateService = new GhoDiscountRateStrategyService(provider, address);

      const [ghoDiscountedPerToken] = await Promise.all([
        ghoDiscountRateService.getGhoDiscountedPerDiscountToken(),
        get().ghoUpdateDiscountRate(),
      ]);

      const stakedAaveBalance = BigNumber.from(
        get().stakeUserResult?.aave.stakeTokenUserBalance || '0'
      );

      set({
        ghoDiscountableAmount: ghoDiscountedPerToken.mul(stakedAaveBalance),
        ghoDiscountedPerToken,
      });
    },
  };
};
