import {
  GhoDiscountRateStrategyService,
  GhoTokenService,
  GhoVariableDebtTokenService,
  Pool,
} from '@aave/contract-helpers';
import BigNumber from 'bignumber.js';
import { BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import {
  convertBpsToPercentage,
  GHO_SUPPORTED_MARKETS,
  normalizeBaseVariableBorrowRate,
} from 'src/utils/ghoUtilities';
import {
  CustomMarket,
  ENABLE_TESTNET,
  getProvider,
  MarketDataType,
  marketsData,
  STAGING_ENV,
} from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

interface GhoMarketConfig {
  market: MarketDataType;
  ghoTokenAddress: string;
  ghoVariableDebtTokenAddress: string;
  facilitatorAddress: string;
}

const goerliGhoConfig: GhoMarketConfig = {
  market: marketsData[CustomMarket.proto_goerli_gho_v3],
  ghoTokenAddress: '0xa48ddcca78a09c37b4070b3e210d6e0234911549',
  ghoVariableDebtTokenAddress: '0x2A379e5d2871123F301b2c73463cE011EcB217e6',
  facilitatorAddress: '0x12cA83Bd0d5887865b7a43B73bbF586D7C087943',
};

// TODO: update when we launch GHO on mainnet
// NOTE: these addresses are Goerli addresses, and should be updated on launch
const mainnetGhoConfig: GhoMarketConfig = {
  market: marketsData[CustomMarket.proto_mainnet],
  ghoTokenAddress: '0xa48ddcca78a09c37b4070b3e210d6e0234911549',
  ghoVariableDebtTokenAddress: '0x2A379e5d2871123F301b2c73463cE011EcB217e6',
  facilitatorAddress: '0x12cA83Bd0d5887865b7a43B73bbF586D7C087943',
};

export interface GhoSlice {
  ghoUserDiscountRate: BigNumber;
  ghoDiscountedPerToken: string;
  ghoDiscountRatePercent: number;
  ghoDiscountLockPeriod: BigNumber;
  ghoFacilitators: string[];
  ghoFacilitatorBucketLevel: BigNumber;
  ghoFacilitatorBucketCapacity: BigNumber;
  ghoMinDebtTokenBalanceForEligibleDiscount: number;
  ghoMinDiscountTokenBalanceForEligibleDiscount: number;
  ghoBorrowAPY: number;
  ghoLoadingMarketData: boolean;
  ghoLoadingData: boolean;
  ghoComputed: {
    borrowAPYWithMaxDiscount: number;
    discountableAmount: number;
    percentageOfGhoMinted: number;
    maxAvailableFromFacilitator: BigNumber;
  };
  ghoDisplay: {
    facilitatorBucketLevel: string;
    facilitatorBucketCapacity: string;
    maxAvailableFromFacilitator: string;
  };
  ghoMarketConfig: () => GhoMarketConfig;
  ghoCalculateDiscountRate: (
    ghoDebtTokenBalance: BigNumberish,
    stakedAaveBalance: BigNumberish
  ) => Promise<number>;
  refreshGhoData: () => Promise<void>;
  fetchGhoMarketData: () => Promise<void>;
}

export const createGhoSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  GhoSlice
> = (set, get) => {
  return {
    ghoComputed: {
      // These 'computed' getters are helpers for components to access commonly used values derived from the state.
      // Because they are getters, they will run when the store is initialzed, so they need to guard against the store being undefined.
      get borrowAPYWithMaxDiscount() {
        if (!get()) return 0;
        const { ghoBorrowAPY, ghoDiscountRatePercent } = { ...get() };

        return ghoBorrowAPY * (1 - ghoDiscountRatePercent);
      },
      get discountableAmount() {
        if (!get()) return 0;
        const stakedAaveBalance = get().stkAaveBalance ?? 0;
        const discountPerToken = get().ghoDiscountedPerToken;
        return stakedAaveBalance * Number(discountPerToken);
      },
      get percentageOfGhoMinted() {
        if (!get()) return 0;
        const { ghoFacilitatorBucketCapacity, ghoFacilitatorBucketLevel } = { ...get() };

        if (ghoFacilitatorBucketCapacity.isZero()) return 0;

        return ghoFacilitatorBucketLevel
          .multipliedBy(100)
          .dividedBy(ghoFacilitatorBucketCapacity)
          .toNumber();
      },
      get maxAvailableFromFacilitator() {
        if (!get()) return new BigNumber(0);
        const { ghoFacilitatorBucketCapacity, ghoFacilitatorBucketLevel } = { ...get() };
        if (ghoFacilitatorBucketCapacity.isZero()) return new BigNumber(0);

        return ghoFacilitatorBucketCapacity.minus(ghoFacilitatorBucketLevel);
      },
    },
    ghoDisplay: {
      // These 'display' getters are helpers for components to retrieve the friendly display values of the state.
      get facilitatorBucketLevel() {
        if (!get()) return '0';
        const { ghoFacilitatorBucketLevel } = { ...get() };
        return ghoFacilitatorBucketLevel.shiftedBy(-18).toString();
      },
      get facilitatorBucketCapacity() {
        if (!get()) return '0';
        const { ghoFacilitatorBucketCapacity } = { ...get() };
        return ghoFacilitatorBucketCapacity.shiftedBy(-18).toString();
      },
      get maxAvailableFromFacilitator() {
        if (!get()) return '0';
        const { ghoComputed } = { ...get() };
        return ghoComputed.maxAvailableFromFacilitator.shiftedBy(-18).toString();
      },
    },
    ghoFacilitators: [],
    ghoDiscountedPerToken: '0',
    ghoUserDiscountRate: new BigNumber(0),
    ghoDiscountRatePercent: 0,
    ghoDiscountLockPeriod: new BigNumber(0),
    ghoFacilitatorBucketLevel: new BigNumber(0),
    ghoFacilitatorBucketCapacity: new BigNumber(0),
    ghoMinDebtTokenBalanceForEligibleDiscount: 1,
    ghoMinDiscountTokenBalanceForEligibleDiscount: 1,
    ghoBorrowAPY: 0,
    ghoLoadingMarketData: true,
    ghoLoadingData: true,
    ghoMarketConfig: () => {
      return STAGING_ENV || ENABLE_TESTNET ? goerliGhoConfig : mainnetGhoConfig;
    },
    ghoCalculateDiscountRate: async (
      ghoDebtTokenBalance: BigNumberish,
      stakedAaveBalance: BigNumberish
    ) => {
      const provider = get().jsonRpcProvider();
      const address = get().ghoMarketConfig().ghoVariableDebtTokenAddress;
      const ghoDiscountRateService = new GhoDiscountRateStrategyService(provider, address);
      const rateBps = await ghoDiscountRateService.calculateDiscountRate(
        ghoDebtTokenBalance,
        stakedAaveBalance
      );
      return convertBpsToPercentage(rateBps);
    },
    refreshGhoData: async () => {
      get().fetchGhoMarketData();

      const ghoConfig = get().ghoMarketConfig();
      if (!ghoConfig) return;

      const account = get().account;
      const currentMarket = get().currentMarket;
      if (!account || !currentMarket || !GHO_SUPPORTED_MARKETS.includes(currentMarket)) return;

      const provider = get().jsonRpcProvider();
      const address = get().ghoMarketConfig().ghoVariableDebtTokenAddress;
      const ghoDiscountRateService = new GhoDiscountRateStrategyService(provider, address);
      const ghoVariableDebtTokenService = new GhoVariableDebtTokenService(provider, address);
      const ghoTokenService = new GhoTokenService(provider, ghoConfig.ghoTokenAddress);
      const ghoDebtTokenService = new GhoVariableDebtTokenService(provider, address);

      const [
        ghoDiscountedPerToken,
        ghoDiscountRate,
        ghoDiscountLockPeriod,
        facilitatorInfo,
        ghoMinDebtTokenBalanceForEligibleDiscount,
        ghoMinDiscountTokenBalanceForEligibleDiscount,
        discountRate,
      ] = await Promise.all([
        ghoDiscountRateService.getGhoDiscountedPerDiscountToken(),
        ghoDiscountRateService.getGhoDiscountRate(),
        ghoVariableDebtTokenService.getDiscountLockPeriod(),
        ghoTokenService.getFacilitatorBucket(ghoConfig.facilitatorAddress),
        ghoDiscountRateService.getGhoMinDebtTokenBalance(),
        ghoDiscountRateService.getGhoMinDiscountTokenBalance(),
        ghoDebtTokenService.getUserDiscountPercent(account),
      ]);

      set({
        ghoFacilitatorBucketLevel: new BigNumber(facilitatorInfo.level.toString()), // TODO: typings aren't being pulled through here from utils
        ghoFacilitatorBucketCapacity: new BigNumber(facilitatorInfo.maxCapacity.toString()), // TODO: typings aren't being pulled through here from utils
        ghoDiscountedPerToken: formatUnits(ghoDiscountedPerToken, 18),
        ghoDiscountRatePercent: convertBpsToPercentage(ghoDiscountRate), // discount rate is in bps, convert to percentage
        ghoDiscountLockPeriod: new BigNumber(ghoDiscountLockPeriod.toString()),
        ghoMinDebtTokenBalanceForEligibleDiscount: Number(
          formatUnits(ghoMinDebtTokenBalanceForEligibleDiscount, 18)
        ),
        ghoMinDiscountTokenBalanceForEligibleDiscount: Number(
          formatUnits(ghoMinDiscountTokenBalanceForEligibleDiscount, 18)
        ),
        ghoUserDiscountRate: new BigNumber(discountRate.toString()),
      });

      set({ ghoLoadingData: false });
    },
    fetchGhoMarketData: async () => {
      // Fetch gho data regardless of which market the user has selected so it can be displayed on the staking page
      // We assume there is only one testnet market with gho, and one mainnet market for gho.
      const config = get().ghoMarketConfig();
      if (!config) return;

      const poolContract = new Pool(getProvider(config.market.chainId), {
        POOL: config.market.addresses.LENDING_POOL,
      });

      const reserve = await poolContract.getReserveData(config.ghoTokenAddress);
      set({
        ghoBorrowAPY: normalizeBaseVariableBorrowRate(reserve.currentVariableBorrowRate.toString()),
        ghoLoadingMarketData: false,
      });
    },
  };
};
