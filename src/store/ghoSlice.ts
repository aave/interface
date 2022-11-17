import {
  GhoDiscountRateStrategyService,
  GhoTokenService,
  GhoVariableDebtTokenService,
  Pool,
} from '@aave/contract-helpers';
import { BigNumber, BigNumberish } from 'ethers';
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

export interface GhoSlice {
  ghoUserDiscountRate: BigNumber;
  ghoDiscountedPerToken: string;
  ghoDiscountRatePercent: number;
  ghoDiscountLockPeriod: BigNumber;
  ghoFacilitators: string[];
  ghoFacilitatorBucketLevel: string;
  ghoFacilitatorBucketCapacity: string;
  ghoMinDebtTokenBalanceForEligibleDiscount: number;
  ghoMinDiscountTokenBalanceForEligibleDiscount: number;
  ghoBorrowAPR: number;
  ghoLoadingMarketData: boolean;
  ghoLoadingData: boolean;
  ghoComputed: {
    borrowAPRWithMaxDiscount: number;
    discountableAmount: number;
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
      get borrowAPRWithMaxDiscount() {
        if (!get()) return 0;
        const { ghoBorrowAPR, ghoDiscountRatePercent } = { ...get() };

        return ghoBorrowAPR * (1 - ghoDiscountRatePercent);
      },
      get discountableAmount() {
        if (!get()) return 0;
        const stakedAaveBalance = get().stakeUserResult?.aave.stakeTokenUserBalance ?? '0';
        const stakedAaveBalanceNormalized = formatUnits(stakedAaveBalance, 18);
        const discountPerToken = get().ghoDiscountedPerToken;
        return Number(stakedAaveBalanceNormalized) * Number(discountPerToken);
      },
    },
    ghoFacilitators: [],
    ghoDiscountedPerToken: '0',
    ghoUserDiscountRate: BigNumber.from(0),
    ghoDiscountRatePercent: 0,
    ghoDiscountLockPeriod: BigNumber.from(0),
    ghoFacilitatorBucketLevel: '0',
    ghoFacilitatorBucketCapacity: '0',
    ghoMinDebtTokenBalanceForEligibleDiscount: 1,
    ghoMinDiscountTokenBalanceForEligibleDiscount: 1,
    ghoBorrowAPR: 0,
    ghoLoadingMarketData: true,
    ghoLoadingData: true,
    ghoMarketConfig: () => {
      if (STAGING_ENV || ENABLE_TESTNET) {
        return goerliGhoConfig;
      } else {
        //TODO: once v3 is on mainnet update this.
        return goerliGhoConfig;
      }
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

      const bucketLevel = facilitatorInfo.level as BigNumber; // TODO: typings aren't being pulled through here from utils
      const maxCapacity = facilitatorInfo.maxCapacity as BigNumber; // TODO: typings aren't being pulled through here from utils

      set({
        ghoFacilitatorBucketLevel: formatUnits(bucketLevel, 18),
        ghoFacilitatorBucketCapacity: formatUnits(maxCapacity, 18),
        ghoDiscountedPerToken: formatUnits(ghoDiscountedPerToken, 18),
        ghoDiscountRatePercent: convertBpsToPercentage(ghoDiscountRate), // discount rate is in bps, convert to percentage
        ghoDiscountLockPeriod,
        ghoMinDebtTokenBalanceForEligibleDiscount: Number(
          formatUnits(ghoMinDebtTokenBalanceForEligibleDiscount, 18)
        ),
        ghoMinDiscountTokenBalanceForEligibleDiscount: Number(
          formatUnits(ghoMinDiscountTokenBalanceForEligibleDiscount, 18)
        ),
        ghoUserDiscountRate: discountRate,
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
        ghoBorrowAPR: normalizeBaseVariableBorrowRate(reserve.currentVariableBorrowRate.toString()),
        ghoLoadingMarketData: false,
      });
    },
  };
};
