import {
  ApproveDelegationType,
  ApproveType,
  BaseDebtToken,
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
  LendingPoolBundle,
  MAX_UINT_AMOUNT,
  PermitSignature,
  Pool,
  PoolBaseCurrencyHumanized,
  PoolBundle,
  ReserveDataHumanized,
  ReservesIncentiveDataHumanized,
  UiIncentiveDataProvider,
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
  LPSupplyParamsType,
  LPSupplyWithPermitType,
} from '@aave/contract-helpers/dist/esm/v3-pool-contract/lendingPoolTypes';
import { SignatureLike } from '@ethersproject/bytes';
import dayjs from 'dayjs';
import { BigNumber, PopulatedTransaction, Signature, utils } from 'ethers';
import { splitSignature } from 'ethers/lib/utils';
import { produce } from 'immer';
import { ClaimRewardsActionsProps } from 'src/components/transactions/ClaimRewards/ClaimRewardsActions';
import { CollateralRepayActionProps } from 'src/components/transactions/Repay/CollateralRepayActions';
import { RepayActionProps } from 'src/components/transactions/Repay/RepayActions';
import { SwapActionProps } from 'src/components/transactions/Swap/SwapActions';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { minBaseTokenRemainingByNetwork, optimizedPath } from 'src/utils/utils';
import { StateCreator } from 'zustand';

import { selectCurrentChainIdV3MarketData, selectFormattedReserves } from './poolSelectors';
import { RootStore } from './root';

// TODO: what is the better name for this type?
export type PoolReserve = {
  reserves?: ReserveDataHumanized[];
  reserveIncentives?: ReservesIncentiveDataHumanized[];
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
  isFaucetPermissioned: boolean;
  setIsFaucetPermissioned: (isPermissioned: boolean) => void;
  mint: (args: Omit<FaucetParamsType, 'userAddress'>) => Promise<EthereumTransactionTypeExtended[]>;
  withdraw: (
    args: Omit<LPWithdrawParamsType, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  setUsageAsCollateral: (
    args: Omit<LPSetUsageAsCollateral, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  swapBorrowRateMode: (
    args: Omit<LPSwapBorrowRateMode, 'user'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  paraswapRepayWithCollateral: (
    args: CollateralRepayActionProps
  ) => Promise<EthereumTransactionTypeExtended[]>;
  setUserEMode: (categoryId: number) => Promise<EthereumTransactionTypeExtended[]>;
  signERC20Approval: (args: Omit<LPSignERC20ApprovalType, 'user'>) => Promise<string>;
  claimRewards: (args: ClaimRewardsActionsProps) => Promise<EthereumTransactionTypeExtended[]>;
  // TODO: optimize types to use only neccessary properties
  swapCollateral: (args: SwapActionProps) => Promise<EthereumTransactionTypeExtended[]>;
  repay: (
    args: Pick<RepayActionProps, 'repayWithATokens' | 'amountToRepay' | 'poolAddress' | 'debtType'>
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repayWithPermit: (
    args: Pick<RepayActionProps, 'poolAddress' | 'amountToRepay' | 'debtType'> & {
      signature: SignatureLike;
      deadline: string;
    }
  ) => Promise<EthereumTransactionTypeExtended[]>;
  poolComputed: {
    minRemainingBaseTokenBalance: string;
  };
  generateSignatureRequest: (args: {
    token: string;
    amount: string;
    deadline: string;
    spender: string;
  }) => Promise<string>;
  // PoolBundle and LendingPoolBundle methods
  generateApproval: (args: ApproveType) => PopulatedTransaction;
  supply: (args: Omit<LPSupplyParamsType, 'user'>) => PopulatedTransaction;
  supplyWithPermit: (args: Omit<LPSupplyWithPermitType, 'user'>) => PopulatedTransaction;
  getApprovedAmount: (args: { token: string }) => Promise<ApproveType>;
  borrow: (args: Omit<LPBorrowParamsType, 'user'>) => PopulatedTransaction;
  getCreditDelegationApprovedAmount: (
    args: Omit<ApproveDelegationType, 'user' | 'amount'>
  ) => Promise<ApproveDelegationType>;
  generateApproveDelegation: (args: Omit<ApproveDelegationType, 'user'>) => PopulatedTransaction;
  estimateGasLimit: (tx: PopulatedTransaction) => Promise<PopulatedTransaction>;
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
  function getCorrectPoolBundle() {
    const currentMarketData = get().currentMarketData;
    const provider = get().jsonRpcProvider();
    if (currentMarketData.v3) {
      return new PoolBundle(provider, {
        POOL: currentMarketData.addresses.LENDING_POOL,
        WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
        L2_ENCODER: currentMarketData.addresses.L2_ENCODER,
      });
    } else {
      return new LendingPoolBundle(provider, {
        LENDING_POOL: currentMarketData.addresses.LENDING_POOL,
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
      const uiIncentiveDataProviderContract = new UiIncentiveDataProvider({
        uiIncentiveDataProviderAddress:
          currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER || '',
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
        promises.push(
          uiIncentiveDataProviderContract
            .getReservesIncentivesDataHumanized({
              lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
            })
            .then((reserveIncentivesResponse) =>
              set((state) =>
                produce(state, (draft) => {
                  if (!draft.data.get(currentChainId)) draft.data.set(currentChainId, new Map());
                  if (!draft.data.get(currentChainId)?.get(lendingPoolAddressProvider)) {
                    draft.data.get(currentChainId)!.set(lendingPoolAddressProvider, {
                      reserveIncentives: reserveIncentivesResponse,
                    });
                  } else {
                    draft.data
                      .get(currentChainId)!
                      .get(lendingPoolAddressProvider)!.reserveIncentives =
                      reserveIncentivesResponse;
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
      const v3MarketData = selectCurrentChainIdV3MarketData(get());
      get().refreshPoolData(v3MarketData);
    },
    isFaucetPermissioned: true,
    generateApproval: (args: ApproveType) => {
      const provider = get().jsonRpcProvider();
      const tokenERC20Service = new ERC20Service(provider);
      return tokenERC20Service.approveTxData({ ...args, amount: MAX_UINT_AMOUNT });
    },
    supply: (args: Omit<LPSupplyParamsType, 'user'>) => {
      const poolBundle = getCorrectPoolBundle();
      const currentAccount = get().account;
      if (poolBundle instanceof PoolBundle) {
        return poolBundle.supplyTxBuilder.generateTxData({
          user: currentAccount,
          reserve: args.reserve,
          amount: args.amount,
          useOptimizedPath: get().useOptimizedPath(),
        });
      } else {
        const lendingPool = poolBundle as LendingPoolBundle;
        return lendingPool.depositTxBuilder.generateTxData({
          user: currentAccount,
          reserve: args.reserve,
          amount: args.amount,
        });
      }
    },
    supplyWithPermit: (args: Omit<LPSupplyWithPermitType, 'user'>) => {
      const poolBundle = getCorrectPoolBundle() as PoolBundle;
      const user = get().account;
      const signature = utils.joinSignature(args.signature);
      return poolBundle.supplyTxBuilder.generateSignedTxData({
        reserve: args.reserve,
        amount: args.amount,
        user,
        deadline: args.deadline,
        useOptimizedPath: get().useOptimizedPath(),
        signature,
      });
    },
    getApprovedAmount: async (args: { token: string }) => {
      const poolBundle = getCorrectPoolBundle();
      const user = get().account;
      if (poolBundle instanceof PoolBundle) {
        return poolBundle.supplyTxBuilder.getApprovedAmount({ user, token: args.token });
      } else {
        return poolBundle.depositTxBuilder.getApprovedAmount({ user, token: args.token });
      }
    },
    borrow: (args: Omit<LPBorrowParamsType, 'user'>) => {
      const poolBundle = getCorrectPoolBundle();
      const currentAccount = get().account;
      if (poolBundle instanceof PoolBundle) {
        return poolBundle.borrowTxBuilder.generateTxData({
          ...args,
          user: currentAccount,
          useOptimizedPath: get().useOptimizedPath(),
        });
      } else {
        const lendingPool = poolBundle as LendingPoolBundle;
        return lendingPool.borrowTxBuilder.generateTxData({
          ...args,
          user: currentAccount,
        });
      }
    },
    getCreditDelegationApprovedAmount: async (
      args: Omit<ApproveDelegationType, 'user' | 'amount'>
    ) => {
      const provider = get().jsonRpcProvider();
      const tokenERC20Service = new ERC20Service(provider);
      const debtTokenService = new BaseDebtToken(provider, tokenERC20Service);
      const user = get().account;
      const approvedAmount = await debtTokenService.approvedDelegationAmount({
        ...args,
        user,
      });
      return { ...args, user, amount: approvedAmount.toString() };
    },
    generateApproveDelegation: (args: Omit<ApproveDelegationType, 'user'>) => {
      const provider = get().jsonRpcProvider();
      const tokenERC20Service = new ERC20Service(provider);
      const debtTokenService = new BaseDebtToken(provider, tokenERC20Service);
      return debtTokenService.generateApproveDelegationTxData({ ...args, user: get().account });
    },
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
    poolComputed: {
      get minRemainingBaseTokenBalance() {
        if (!get()) return '0.001';
        const { currentNetworkConfig, currentChainId } = { ...get() };
        const chainId = currentNetworkConfig.underlyingChainId || currentChainId;
        const min = minBaseTokenRemainingByNetwork[chainId];
        return min || '0.001';
      },
    },
    generateSignatureRequest: async ({ token, amount, deadline, spender }) => {
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
    estimateGasLimit: async (tx: PopulatedTransaction) => {
      const provider = get().jsonRpcProvider();
      const defaultGasLimit: BigNumber = tx.gasLimit ? tx.gasLimit : BigNumber.from('0');
      delete tx.gasLimit;
      let estimatedGas = await provider.estimateGas(tx);
      estimatedGas = estimatedGas.mul(115).div(100); // Add 15% buffer
      // use the max of the 2 values, airing on the side of caution to prioritize having enough gas vs submitting w/ most efficient gas limit
      tx.gasLimit = estimatedGas.gt(defaultGasLimit) ? estimatedGas : defaultGasLimit;
      return tx;
    },
  };
};
