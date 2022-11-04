import {
  GhoDiscountRateStrategyService,
  GhoVariableDebtTokenService,
} from '@aave/contract-helpers';
import { BigNumber, BigNumberish } from 'ethers';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface GhoSlice {
  ghoDiscountRateStrategyAddress: string;
  ghoVariableDebtTokenAddress: string;
  ghoUserDiscountRate: BigNumber;
  ghoDiscountedPerToken: BigNumber;
  ghoDiscountableAmount: BigNumber;
  ghoDiscountRatePercent: number;
  ghoFacilitators: string[];
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
    ghoFacilitators: [],
    ghoDiscountableAmount: BigNumber.from(0),
    ghoDiscountedPerToken: BigNumber.from(0),
    ghoVariableDebtTokenAddress: '0xc7fB08a5C343d293609Ee68c6E1a5226aC1a17F2', // TODO: get this from the pool reserve data instead
    ghoDiscountRateStrategyAddress: '0x91A534290666B817D986Ef70089f8Cc5bc241C34', // TODO: remove this once utils is updated to only take debt token contract
    ghoUserDiscountRate: BigNumber.from(0),
    ghoDiscountRatePercent: 0,
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
      const address = get().ghoVariableDebtTokenAddress;
      const ghoDebtTokenService = new GhoVariableDebtTokenService(provider, address);
      const rate = await ghoDebtTokenService.getUserDiscountPercent(get().account);
      set({ ghoUserDiscountRate: rate });
    },
    refreshGhoData: async () => {
      const account = get().account;
      const currentMarketData = get().currentMarketData;
      if (!account || !currentMarketData) return;

      const provider = get().jsonRpcProvider();
      const address = get().ghoDiscountRateStrategyAddress;
      const ghoDiscountRateService = new GhoDiscountRateStrategyService(provider, address);

      const [ghoDiscountedPerToken, ghoDiscountRate] = await Promise.all([
        ghoDiscountRateService.getGhoDiscountedPerDiscountToken(),
        ghoDiscountRateService.getGhoDiscountRate(),
        get().ghoUpdateDiscountRate(),
      ]);

      const stakedAaveBalance = BigNumber.from(
        get().stakeUserResult?.aave.stakeTokenUserBalance || '0'
      );

      set({
        ghoDiscountableAmount: ghoDiscountedPerToken.mul(stakedAaveBalance),
        ghoDiscountedPerToken,
        ghoDiscountRatePercent: ghoDiscountRate.toNumber() * 0.0001,
      });
    },
  };
};
