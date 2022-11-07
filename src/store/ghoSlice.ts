import {
  GhoDiscountRateStrategyService,
  GhoTokenService,
  GhoVariableDebtTokenService,
} from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { BigNumber, BigNumberish } from 'ethers';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

const ghoTokenAddress = '0xA48DdCca78A09c37b4070B3E210D6e0234911549';
const facilitatorAddress = '0x12cA83Bd0d5887865b7a43B73bbF586D7C087943';

export interface GhoSlice {
  ghoDiscountRateStrategyAddress: string;
  ghoVariableDebtTokenAddress: string;
  ghoUserDiscountRate: BigNumber;
  ghoDiscountedPerToken: BigNumber;
  ghoDiscountableAmount: BigNumber;
  ghoDiscountRatePercent: number;
  ghoFacilitators: string[];
  ghoFacilitatorBucketLevel: string;
  ghoFacilitatorBucketCapacity: string;
  ghoMinDebtTokenBalanceForEligibleDiscount: BigNumber;
  ghoMinDiscountTokenBalanceForEligibleDiscount: BigNumber;
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
    ghoFacilitatorBucketLevel: '0',
    ghoFacilitatorBucketCapacity: '0',
    ghoMinDebtTokenBalanceForEligibleDiscount: BigNumber.from(1),
    ghoMinDiscountTokenBalanceForEligibleDiscount: BigNumber.from(1),
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
      const ghoTokenService = new GhoTokenService(provider, ghoTokenAddress);

      const [
        ghoDiscountedPerToken,
        ghoDiscountRate,
        facilitatorInfo,
        ghoMinDebtTokenBalanceForEligibleDiscount,
        ghoMinDiscountTokenBalanceForEligibleDiscount,
      ] = await Promise.all([
        ghoDiscountRateService.getGhoDiscountedPerDiscountToken(),
        ghoDiscountRateService.getGhoDiscountRate(),
        ghoTokenService.getFacilitatorBucket(facilitatorAddress),
        ghoDiscountRateService.getGhoMinDebtTokenBalance(),
        ghoDiscountRateService.getGhoMinDiscountTokenBalance(),
        get().ghoUpdateDiscountRate(),
      ]);

      const stakedAaveBalance = BigNumber.from(
        get().stakeUserResult?.aave.stakeTokenUserBalance || '0'
      );

      const bucketLevel = facilitatorInfo.level as BigNumber; // TODO: typings aren't being pulled through here from utils
      const maxCapacity = facilitatorInfo.maxCapacity as BigNumber; // TODO: typings aren't being pulled through here from utils

      set({
        ghoFacilitatorBucketLevel: normalizeBN(bucketLevel.toString(), 18).toString(),
        ghoFacilitatorBucketCapacity: normalizeBN(maxCapacity.toString(), 18).toString(),
        ghoDiscountableAmount: ghoDiscountedPerToken.mul(stakedAaveBalance),
        ghoDiscountedPerToken,
        ghoDiscountRatePercent: ghoDiscountRate.toNumber() * 0.0001, // discount rate is in bps, convert to percentage
        ghoMinDebtTokenBalanceForEligibleDiscount,
        ghoMinDiscountTokenBalanceForEligibleDiscount,
      });
    },
  };
};
