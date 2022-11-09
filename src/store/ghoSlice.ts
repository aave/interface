import {
  GhoDiscountRateStrategyService,
  GhoTokenService,
  GhoVariableDebtTokenService,
  Pool,
} from '@aave/contract-helpers';
import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { ghoMintingMarkets, normalizeBaseVariableBorrowRate } from 'src/utils/ghoUtilities';
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
  facilitatorAddress: '0x12cA83Bd0d5887865b7a43B73bbF586D7C087943',
  ghoVariableDebtTokenAddress: '0x2A379e5d2871123F301b2c73463cE011EcB217e6',
};

const getGhoMarketConfig = () => {
  if (STAGING_ENV || ENABLE_TESTNET) {
    return goerliGhoConfig;
  } else {
    // TODO: once v3 is on mainnet update this.
    // return marketsData[CustomMarket.proto_mainnet];
  }
};

export interface GhoSlice {
  ghoVariableDebtTokenAddress: string;
  ghoUserDiscountRate: BigNumber;
  ghoDiscountedPerToken: string;
  ghoDiscountRatePercent: number;
  ghoFacilitators: string[];
  ghoFacilitatorBucketLevel: string;
  ghoFacilitatorBucketCapacity: string;
  ghoMinDebtTokenBalanceForEligibleDiscount: BigNumber;
  ghoMinDiscountTokenBalanceForEligibleDiscount: BigNumber;
  ghoBorrowAPR: number;
  ghoComputed: {
    borrowAPRWithMaxDiscount: () => number;
  };
  ghoUpdateDiscountRate: () => Promise<void>;
  ghoCalculateDiscountRate: (
    ghoDebtTokenBalance: BigNumberish,
    stakedAaveBalance: BigNumberish
  ) => Promise<BigNumber>;
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
      borrowAPRWithMaxDiscount: () => {
        const borrowAPR = get().ghoBorrowAPR;
        const discountRate = get().ghoDiscountRatePercent;
        return borrowAPR * (1 - discountRate);
      },
    },
    ghoFacilitators: [],
    ghoDiscountedPerToken: '0',
    ghoVariableDebtTokenAddress: '0x2A379e5d2871123F301b2c73463cE011EcB217e6',
    ghoUserDiscountRate: BigNumber.from(0),
    ghoDiscountRatePercent: 0,
    ghoFacilitatorBucketLevel: '0',
    ghoFacilitatorBucketCapacity: '0',
    ghoMinDebtTokenBalanceForEligibleDiscount: BigNumber.from(1),
    ghoMinDiscountTokenBalanceForEligibleDiscount: BigNumber.from(1),
    ghoBorrowAPR: 0,
    ghoCalculateDiscountRate: async (
      ghoDebtTokenBalance: BigNumberish,
      stakedAaveBalance: BigNumberish
    ) => {
      const provider = get().jsonRpcProvider();
      const address = get().ghoVariableDebtTokenAddress;
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
      get().fetchGhoMarketData();

      const ghoConfig = getGhoMarketConfig();
      if (!ghoConfig) return;

      const account = get().account;
      const currentMarket = get().currentMarket;
      if (!account || !currentMarket || !ghoMintingMarkets.includes(currentMarket)) return;

      const provider = get().jsonRpcProvider();
      const address = get().ghoVariableDebtTokenAddress;
      const ghoDiscountRateService = new GhoDiscountRateStrategyService(provider, address);
      const ghoTokenService = new GhoTokenService(provider, ghoConfig.ghoTokenAddress);

      const [
        ghoDiscountedPerToken,
        ghoDiscountRate,
        facilitatorInfo,
        ghoMinDebtTokenBalanceForEligibleDiscount,
        ghoMinDiscountTokenBalanceForEligibleDiscount,
      ] = await Promise.all([
        ghoDiscountRateService.getGhoDiscountedPerDiscountToken(),
        ghoDiscountRateService.getGhoDiscountRate(),
        ghoTokenService.getFacilitatorBucket(ghoConfig.facilitatorAddress),
        ghoDiscountRateService.getGhoMinDebtTokenBalance(),
        ghoDiscountRateService.getGhoMinDiscountTokenBalance(),
        get().ghoUpdateDiscountRate(),
      ]);

      const bucketLevel = facilitatorInfo.level as BigNumber; // TODO: typings aren't being pulled through here from utils
      const maxCapacity = facilitatorInfo.maxCapacity as BigNumber; // TODO: typings aren't being pulled through here from utils

      set({
        ghoFacilitatorBucketLevel: formatUnits(bucketLevel, 18),
        ghoFacilitatorBucketCapacity: formatUnits(maxCapacity, 18),
        ghoDiscountedPerToken: formatUnits(ghoDiscountedPerToken, 18),
        ghoDiscountRatePercent: ghoDiscountRate.toNumber() * 0.0001, // discount rate is in bps, convert to percentage
        ghoMinDebtTokenBalanceForEligibleDiscount,
        ghoMinDiscountTokenBalanceForEligibleDiscount,
      });
    },
    fetchGhoMarketData: async () => {
      // Fetch gho data regardless of which market the user has selected so it can be displayed on the staking page
      // We assume there is only one testnet market with gho, and one mainnet market for gho.
      const config = getGhoMarketConfig();
      if (!config) return;

      const poolContract = new Pool(getProvider(config.market.chainId), {
        POOL: config.market.addresses.LENDING_POOL,
      });

      const reserve = await poolContract.getReserveData(config.ghoTokenAddress);
      set({
        ghoBorrowAPR: normalizeBaseVariableBorrowRate(reserve.currentVariableBorrowRate.toString()),
      });
    },
  };
};
