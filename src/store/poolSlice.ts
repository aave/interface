import {
  ERC20_2612Service,
  ERC20Service,
  EthereumTransactionTypeExtended,
  FaucetParamsType,
  FaucetService,
  IncentivesController,
  IncentivesControllerV2,
  IncentivesControllerV2Interface,
  InterestRate,
  LendingPool,
  PermitSignature,
  Pool,
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
  V3FaucetService,
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
import { Signature } from 'ethers';
import { splitSignature } from 'ethers/lib/utils';
import { produce } from 'immer';
import { ClaimRewardsActionsProps } from 'src/components/transactions/ClaimRewards/ClaimRewardsActions';
import { CollateralRepayActionProps } from 'src/components/transactions/Repay/CollateralRepayActions';
import { RepayActionProps } from 'src/components/transactions/Repay/RepayActions';
import { SupplyActionProps } from 'src/components/transactions/Supply/SupplyActions';
import { SwapActionProps } from 'src/components/transactions/Swap/SwapActions';
import { minBaseTokenRemainingByNetwork, optimizedPath } from 'src/utils/utils';
import { StateCreator } from 'zustand';

import { selectFormattedReserves } from './poolSelectors';
import { RootStore } from './root';

// TODO: add chain/provider/account mapping
export interface PoolSlice {
  data: Map<
    number,
    Map<
      string,
      {
        reserves?: ReserveDataHumanized[];
        baseCurrencyData?: PoolBaseCurrencyHumanized;
        userEmodeCategoryId?: number;
        userReserves?: UserReserveDataHumanized[];
      }
    >
  >;
  refreshPoolData: () => Promise<void>;
  // methods
  useOptimizedPath: () => boolean | undefined;
  isFaucetPermissioned: boolean;
  setIsFaucetPermissioned: (isPermissioned: boolean) => void;
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
  // TO-DO: Move to @aave/contract-helpers, build with approval transaction, and re-use for staking and pool permit functions
  generateSignatureRequst: (args: {
    token: string;
    amount: string;
    deadline: string;
    spender: string;
  }) => Promise<string>;
  poolComputed: {
    minRemainingBaseTokenBalance: string;
  };
}

export const createPoolSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
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
    refreshPoolData: async () => {
      const account = get().account;
      const currentMarketData = get().currentMarketData;
      const currentChainId = get().currentChainId;
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
    isFaucetPermissioned: true,
    setIsFaucetPermissioned: (value: boolean) => set({ isFaucetPermissioned: value }),
    mint: async (args) => {
      const { jsonRpcProvider, currentMarketData, account: userAddress } = get();

      if (!currentMarketData.addresses.FAUCET)
        throw Error('currently selected market does not have a faucet attached');

      if (currentMarketData.v3) {
        const v3Service = new V3FaucetService(
          jsonRpcProvider(),
          currentMarketData.addresses.FAUCET
        );
        return v3Service.mint({ ...args, userAddress });
      } else {
        const service = new FaucetService(jsonRpcProvider(), currentMarketData.addresses.FAUCET);
        return service.mint({ ...args, userAddress });
      }
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
      signature,
      deadline,
      signedAmount,
    }) => {
      const user = get().account;
      const pool = getCorrectPool();

      let permitSignature: PermitSignature | undefined;

      if (signature && deadline && signedAmount) {
        const sig: Signature = splitSignature(signature);
        permitSignature = {
          amount: signedAmount,
          deadline: deadline,
          v: sig.v,
          r: sig.r,
          s: sig.s,
        };
      }
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
        permitSignature,
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
      signature,
      deadline,
      signedAmount,
    }) => {
      const pool = getCorrectPool();
      const user = get().account;

      let permitSignature: PermitSignature | undefined;

      if (signature && deadline && signedAmount) {
        const sig: Signature = splitSignature(signature);
        permitSignature = {
          amount: signedAmount,
          deadline: deadline,
          v: sig.v,
          r: sig.r,
          s: sig.s,
        };
      }

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
        permitSignature,
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
    // TO-DO: Move to @aave/contract-helpers, build with approval transaction, and re-use for staking and pool permit functions
    generateSignatureRequst: async ({ token, amount, deadline, spender }) => {
      const provider = get().jsonRpcProvider();
      const tokenERC20Service = new ERC20Service(provider);
      const tokenERC2612Service = new ERC20_2612Service(provider);
      const { name } = await tokenERC20Service.getTokenData(token);
      const { chainId } = await provider.getNetwork();
      const nonce = await tokenERC2612Service.getNonce({ token, owner: get().account });
      const typeData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Permit',
        domain: {
          name,
          version: '1',
          chainId,
          verifyingContract: token,
        },
        message: {
          owner: get().account,
          spender: spender,
          value: amount,
          nonce,
          deadline,
        },
      };
      return JSON.stringify(typeData);
    },
    poolComputed: {
      get minRemainingBaseTokenBalance() {
        if (!get()) return '0.001';
        const { currentNetworkConfig, currentChainId } = { ...get() };
        const chainId = currentNetworkConfig.underlyingChainId || currentChainId;
        const min = minBaseTokenRemainingByNetwork[chainId];
        return min || '0.001';
      },
    },
  };
};
