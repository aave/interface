import {
  EthereumTransactionTypeExtended,
  FaucetParamsType,
  FaucetService,
  IncentivesController,
  IncentivesControllerV2,
  IncentivesControllerV2Interface,
  InterestRate,
  LendingPool,
  Pool,
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import {
  LPBorrowParamsType,
  LPSetUsageAsCollateral,
  LPSwapBorrowRateMode,
  LPWithdrawParamsType,
} from '@aave/contract-helpers/dist/esm/lendingPool-contract/lendingPoolTypes';
import {
  LPSignERC20ApprovalType,
  LPSupplyWithPermitType,
} from '@aave/contract-helpers/dist/esm/v3-pool-contract/lendingPoolTypes';
import { SignatureLike } from '@ethersproject/bytes';
import dayjs from 'dayjs';
import { produce } from 'immer';
import { ClaimRewardsActionsProps } from 'src/components/transactions/ClaimRewards/ClaimRewardsActions';
import { CollateralRepayActionProps } from 'src/components/transactions/Repay/CollateralRepayActions';
import { RepayActionProps } from 'src/components/transactions/Repay/RepayActions';
import { SupplyActionProps } from 'src/components/transactions/Supply/SupplyActions';
import { SwapActionProps } from 'src/components/transactions/Swap/SwapActions';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { marketsData } from 'src/utils/marketsAndNetworksConfig';
import { optimizedPath } from 'src/utils/utils';
import { StateCreator } from 'zustand';

import { selectCurrentChainIdV3MarketKey, selectFormattedReserves } from './poolSelectors';
import { RootStore } from './root';

// TODO: what is the better name for this type?
export type PoolReserve = {
  reserves?: ReserveDataHumanized[];
  baseCurrencyData?: PoolBaseCurrencyHumanized;
  userEmodeCategoryId?: number;
  userReserves?: UserReserveDataHumanized[];
};

// TODO: add chain/provider/account mapping
export interface PoolSlice {
  data: Map<number, Map<string, PoolReserve>>;
  refreshPoolData: (marketData?: MarketDataType) => Promise<void>;
  refreshPoolV3Data: () => Promise<void>;
  // methods
  useOptimizedPath: () => boolean | undefined;
  mint: (args: Omit<FaucetParamsType, 'userAddress'>) => Promise<EthereumTransactionTypeExtended[]>;
  withdraw: (
    args: Omit<LPWithdrawParamsType, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  borrow: (args: Omit<LPBorrowParamsType, 'user'>) => Promise<EthereumTransactionTypeExtended[]>;
  setUsageAsCollateral: (
    args: Omit<LPSetUsageAsCollateral, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  swapBorrowRateMode: (
    args: Omit<LPSwapBorrowRateMode, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  paraswapRepayWithCollateral: (
    args: CollateralRepayActionProps
  ) => Promise<EthereumTransactionTypeExtended[]>;
  supplyWithPermit: (
    args: Omit<LPSupplyWithPermitType, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  setUserEMode: (categoryId: number) => Promise<EthereumTransactionTypeExtended[]>;
  signERC20Approval: (args: Omit<LPSignERC20ApprovalType, 'user'>) => Promise<string>;
  claimRewards: (args: ClaimRewardsActionsProps) => Promise<EthereumTransactionTypeExtended[]>;
  // TODO: optimize types to use only neccessary properties
  swapCollateral: (args: SwapActionProps) => Promise<EthereumTransactionTypeExtended[]>;
  repay: (args: RepayActionProps) => Promise<EthereumTransactionTypeExtended[]>;
  repayWithPermit: (
    args: RepayActionProps & {
      signature: SignatureLike;
      deadline: string;
    }
  ) => Promise<EthereumTransactionTypeExtended[]>;
  supply: (
    args: Omit<SupplyActionProps, 'poolReserve'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
}

export const createPoolSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  PoolSlice
> = (set, get) => {
  function getCorrectPool() {
    const currentMarketData = get().currentMarketData;
    const provider = get().jsonRpcProvider();
    if (currentMarketData.v3) {
      return new Pool(provider, {
        POOL: currentMarketData.addresses.LENDING_POOL,
        REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
        SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
        WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
        L2_ENCODER: currentMarketData.addresses.L2_ENCODER,
      });
    } else {
      return new LendingPool(provider, {
        LENDING_POOL: currentMarketData.addresses.LENDING_POOL,
        REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
        SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
        WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
      });
    }
  }
  return {
    data: new Map(),
    refreshPoolData: async (marketData?: MarketDataType) => {
      const account = get().account;
      const currentChainId = get().currentChainId;
      const currentMarketData = marketData || get().currentMarketData;
      const poolDataProviderContract = new UiPoolDataProvider({
        uiPoolDataProviderAddress: currentMarketData.addresses.UI_POOL_DATA_PROVIDER,
        provider: get().jsonRpcProvider(),
        chainId: currentChainId,
      });
      const lendingPoolAddressProvider = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
      const promises: Promise<void>[] = [];
      try {
        promises.push(
          poolDataProviderContract
            .getReservesHumanized({
              lendingPoolAddressProvider,
            })
            .then((reservesResponse) =>
              set((state) =>
                produce(state, (draft) => {
                  if (!draft.data.get(currentChainId)) draft.data.set(currentChainId, new Map());
                  if (!draft.data.get(currentChainId)?.get(lendingPoolAddressProvider)) {
                    draft.data.get(currentChainId)!.set(lendingPoolAddressProvider, {
                      reserves: reservesResponse.reservesData,
                      baseCurrencyData: reservesResponse.baseCurrencyData,
                    });
                  } else {
                    draft.data.get(currentChainId)!.get(lendingPoolAddressProvider)!.reserves =
                      reservesResponse.reservesData;
                    draft.data
                      .get(currentChainId)!
                      .get(lendingPoolAddressProvider)!.baseCurrencyData =
                      reservesResponse.baseCurrencyData;
                  }
                })
              )
            )
        );
        if (account) {
          promises.push(
            poolDataProviderContract
              .getUserReservesHumanized({
                lendingPoolAddressProvider,
                user: account,
              })
              .then((userReservesResponse) =>
                set((state) =>
                  produce(state, (draft) => {
                    if (!draft.data.get(currentChainId)) draft.data.set(currentChainId, new Map());
                    if (!draft.data.get(currentChainId)?.get(lendingPoolAddressProvider)) {
                      draft.data.get(currentChainId)!.set(lendingPoolAddressProvider, {
                        userReserves: userReservesResponse.userReserves,
                        userEmodeCategoryId: userReservesResponse.userEmodeCategoryId,
                      });
                    } else {
                      draft.data
                        .get(currentChainId)!
                        .get(lendingPoolAddressProvider)!.userReserves =
                        userReservesResponse.userReserves;
                      draft.data
                        .get(currentChainId)!
                        .get(lendingPoolAddressProvider)!.userEmodeCategoryId =
                        userReservesResponse.userEmodeCategoryId;
                    }
                  })
                )
              )
          );
        }
        await Promise.all(promises);
      } catch (e) {
        console.log('error fetching pool data', e);
      }
    },
    refreshPoolV3Data: async () => {
      // how to determine which v2 markets to pool? for now always fetch polygon fork
      const marketKey = selectCurrentChainIdV3MarketKey(get());
      const v3MarketData = marketsData[marketKey];
      get().refreshPoolData(v3MarketData);
    },
    mint: async (args) => {
      if (!get().currentMarketData.addresses.FAUCET)
        throw Error('currently selected market does not have a faucet attached');
      const userAddress = get().account;
      const service = new FaucetService(
        get().jsonRpcProvider(),
        get().currentMarketData.addresses.FAUCET
      );
      return service.mint({ ...args, userAddress });
    },
    withdraw: (args) => {
      const pool = getCorrectPool();
      const user = get().account;
      return pool.withdraw({
        ...args,
        user,
        useOptimizedPath: optimizedPath(get().currentChainId),
      });
    },
    borrow: async (args) => {
      const pool = getCorrectPool();
      const user = get().account;
      return pool.borrow({ ...args, user, useOptimizedPath: get().useOptimizedPath() });
    },
    setUsageAsCollateral: async (args) => {
      const pool = getCorrectPool();
      const user = get().account;
      return pool.setUsageAsCollateral({
        ...args,
        user,
        useOptimizedPath: get().useOptimizedPath(),
      });
    },
    swapBorrowRateMode: async (args) => {
      const pool = getCorrectPool();
      const user = get().account;
      return pool.swapBorrowRateMode({ ...args, user, useOptimizedPath: get().useOptimizedPath() });
    },
    paraswapRepayWithCollateral: async ({
      fromAssetData,
      poolReserve,
      repayAmount,
      repayWithAmount,
      repayAllDebt,
      useFlashLoan,
      rateMode,
      augustus,
      swapCallData,
    }) => {
      const user = get().account;
      const pool = getCorrectPool();

      return pool.paraswapRepayWithCollateral({
        user,
        fromAsset: fromAssetData.underlyingAsset,
        fromAToken: fromAssetData.aTokenAddress,
        assetToRepay: poolReserve.underlyingAsset,
        repayWithAmount,
        repayAmount,
        repayAllDebt,
        rateMode,
        flash: useFlashLoan,
        swapAndRepayCallData: swapCallData,
        augustus,
      });
    },
    repay: ({ repayWithATokens, amountToRepay, poolAddress, debtType }) => {
      const pool = getCorrectPool();
      const currentAccount = get().account;
      if (pool instanceof Pool && repayWithATokens) {
        return pool.repayWithATokens({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToRepay,
          rateMode: debtType as InterestRate,
          useOptimizedPath: get().useOptimizedPath(),
        });
      } else {
        return pool.repay({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToRepay,
          interestRateMode: debtType,
          useOptimizedPath: get().useOptimizedPath(),
        });
      }
    },
    repayWithPermit: ({ poolAddress, amountToRepay, debtType, deadline, signature }) => {
      // Better to get rid of direct assert
      const pool = getCorrectPool() as Pool;
      const currentAccount = get().account;
      return pool.repayWithPermit({
        user: currentAccount,
        reserve: poolAddress,
        amount: amountToRepay, // amountToRepay.toString(),
        interestRateMode: debtType,
        signature,
        useOptimizedPath: get().useOptimizedPath(),
        deadline,
      });
    },
    supply: ({ poolAddress, amountToSupply }) => {
      const pool = getCorrectPool();
      const currentAccount = get().account;
      if (pool instanceof Pool) {
        return pool.supply({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToSupply,
          useOptimizedPath: get().useOptimizedPath(),
        });
      } else {
        const lendingPool = pool as LendingPool;
        return lendingPool.deposit({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToSupply,
        });
      }
    },
    supplyWithPermit: (args) => {
      const pool = getCorrectPool() as Pool;
      const user = get().account;
      return pool.supplyWithPermit({
        ...args,
        user,
        useOptimizedPath: get().useOptimizedPath(),
      });
    },
    swapCollateral: async ({
      poolReserve,
      targetReserve,
      isMaxSelected,
      amountToSwap,
      amountToReceive,
      useFlashLoan,
      augustus,
      swapCallData,
    }) => {
      const pool = getCorrectPool();
      const user = get().account;

      return pool.swapCollateral({
        fromAsset: poolReserve.underlyingAsset,
        toAsset: targetReserve.underlyingAsset,
        swapAll: isMaxSelected,
        fromAToken: poolReserve.aTokenAddress,
        fromAmount: amountToSwap,
        minToAmount: amountToReceive,
        user,
        flash: useFlashLoan,
        augustus,
        swapCallData,
      });
    },
    setUserEMode: async (categoryId) => {
      const pool = getCorrectPool() as Pool;
      const user = get().account;
      return pool.setUserEMode({
        user,
        categoryId,
      });
    },
    signERC20Approval: async (args) => {
      const pool = getCorrectPool() as Pool;
      const user = get().account;
      return pool.signERC20Approval({
        ...args,
        user,
      });
    },
    claimRewards: async ({ selectedReward }) => {
      // TODO: think about moving timestamp from hook to EventEmitter
      const timestamp = dayjs().unix();
      const reserves = selectFormattedReserves(get(), timestamp);
      const currentAccount = get().account;

      const allReserves: string[] = [];
      reserves.forEach((reserve) => {
        if (reserve.aIncentivesData && reserve.aIncentivesData.length > 0) {
          allReserves.push(reserve.aTokenAddress);
        }
        if (reserve.vIncentivesData && reserve.vIncentivesData.length > 0) {
          allReserves.push(reserve.variableDebtTokenAddress);
        }
        if (reserve.sIncentivesData && reserve.sIncentivesData.length > 0) {
          allReserves.push(reserve.stableDebtTokenAddress);
        }
      });

      const incentivesTxBuilder = new IncentivesController(get().jsonRpcProvider());
      const incentivesTxBuilderV2: IncentivesControllerV2Interface = new IncentivesControllerV2(
        get().jsonRpcProvider()
      );

      if (get().currentMarketData.v3) {
        if (selectedReward.symbol === 'all') {
          return incentivesTxBuilderV2.claimAllRewards({
            user: currentAccount,
            assets: allReserves,
            to: currentAccount,
            incentivesControllerAddress: selectedReward.incentiveControllerAddress,
          });
        } else {
          return incentivesTxBuilderV2.claimRewards({
            user: currentAccount,
            assets: allReserves,
            to: currentAccount,
            incentivesControllerAddress: selectedReward.incentiveControllerAddress,
            reward: selectedReward.rewardTokenAddress,
          });
        }
      } else {
        return incentivesTxBuilder.claimRewards({
          user: currentAccount,
          assets: selectedReward.assets,
          to: currentAccount,
          incentivesControllerAddress: selectedReward.incentiveControllerAddress,
        });
      }
    },
    useOptimizedPath: () => {
      return get().currentMarketData.v3 && optimizedPath(get().currentChainId);
    },
  };
};
