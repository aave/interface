import {
  AaveTokenV3Service,
  ApproveDelegationType,
  ApproveType,
  BaseDebtToken,
  DebtSwitchAdapterService,
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
  LendingPoolBundleInterface,
  MAX_UINT_AMOUNT,
  PermitSignature,
  Pool,
  PoolBaseCurrencyHumanized,
  PoolBundle,
  PoolBundleInterface,
  ReserveDataHumanized,
  ReservesIncentiveDataHumanized,
  UserReserveDataHumanized,
  V3FaucetService,
  WithdrawAndSwitchAdapterService,
} from '@aave/contract-helpers';
import {
  LPBorrowParamsType,
  LPSetUsageAsCollateral,
  LPSwapBorrowRateMode,
  LPWithdrawParamsType,
} from '@aave/contract-helpers/dist/esm/lendingPool-contract/lendingPoolTypes';
import {
  LPRepayWithPermitParamsType,
  LPSignERC20ApprovalType,
  LPSupplyParamsType,
  LPSupplyWithPermitType,
} from '@aave/contract-helpers/dist/esm/v3-pool-contract/lendingPoolTypes';
import { AaveSafetyModule, AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { BigNumber, PopulatedTransaction, Signature, utils } from 'ethers';
import { splitSignature } from 'ethers/lib/utils';
import { ClaimRewardsActionsProps } from 'src/components/transactions/ClaimRewards/ClaimRewardsActions';
import { DebtSwitchActionProps } from 'src/components/transactions/DebtSwitch/DebtSwitchActions';
import { CollateralRepayActionProps } from 'src/components/transactions/Repay/CollateralRepayActions';
import { SwapActionProps } from 'src/components/transactions/Swap/SwapActions';
import { WithdrawAndSwitchActionProps } from 'src/components/transactions/Withdraw/WithdrawAndSwitchActions';
import { Approval } from 'src/helpers/useTransactionHandler';
import { FormattedReservesAndIncentives } from 'src/hooks/pool/usePoolFormattedReserves';
import { minBaseTokenRemainingByNetwork, optimizedPath } from 'src/utils/utils';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

// TODO: what is the better name for this type?
export type PoolReserve = {
  reserves?: ReserveDataHumanized[];
  reserveIncentives?: ReservesIncentiveDataHumanized[];
  baseCurrencyData?: PoolBaseCurrencyHumanized;
  userEmodeCategoryId?: number;
  userReserves?: UserReserveDataHumanized[];
};

type RepayArgs = {
  amountToRepay: string;
  poolAddress: string;
  debtType: InterestRate;
  repayWithATokens: boolean;
  encodedTxData?: string;
};

type GenerateApprovalOpts = {
  chainId?: number;
  amount?: string;
};

type GenerateSignatureRequestOpts = {
  chainId?: number;
};

// TODO: add chain/provider/account mapping
export interface PoolSlice {
  // methods
  useOptimizedPath: () => boolean | undefined;
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
  debtSwitch: (args: DebtSwitchActionProps) => PopulatedTransaction;
  setUserEMode: (categoryId: number) => Promise<EthereumTransactionTypeExtended[]>;
  signERC20Approval: (args: Omit<LPSignERC20ApprovalType, 'user'>) => Promise<string>;
  claimRewards: (
    args: ClaimRewardsActionsProps & { formattedReserves: FormattedReservesAndIncentives[] }
  ) => Promise<EthereumTransactionTypeExtended[]>;
  // TODO: optimize types to use only neccessary properties
  swapCollateral: (args: SwapActionProps) => Promise<EthereumTransactionTypeExtended[]>;
  withdrawAndSwitch: (args: WithdrawAndSwitchActionProps) => PopulatedTransaction;
  repay: (args: RepayArgs) => PopulatedTransaction;
  encodeRepayParams: (args: RepayArgs) => Promise<string>;
  repayWithPermit: (args: Omit<LPRepayWithPermitParamsType, 'user'>) => PopulatedTransaction;
  encodeRepayWithPermitParams: (
    args: Omit<LPRepayWithPermitParamsType, 'user'>
  ) => Promise<[string, string, string]>;
  poolComputed: {
    minRemainingBaseTokenBalance: string;
  };
  generateSignatureRequest: (
    args: {
      token: string;
      amount: string;
      deadline: string;
      spender: string;
    },
    opts?: GenerateSignatureRequestOpts
  ) => Promise<string>;
  // PoolBundle and LendingPoolBundle methods
  generateApproval: (args: ApproveType, opts?: GenerateApprovalOpts) => PopulatedTransaction;
  supply: (args: Omit<LPSupplyParamsType, 'user'>) => PopulatedTransaction;
  supplyWithPermit: (args: Omit<LPSupplyWithPermitType, 'user'>) => PopulatedTransaction;
  borrow: (args: Omit<LPBorrowParamsType, 'user'>) => PopulatedTransaction;
  getCreditDelegationApprovedAmount: (
    args: Omit<ApproveDelegationType, 'user' | 'amount'>
  ) => Promise<ApproveDelegationType>;
  generateCreditDelegationSignatureRequest: (
    approval: Approval & {
      deadline: string;
      spender: string;
    }
  ) => Promise<string>;
  generateApproveDelegation: (args: Omit<ApproveDelegationType, 'user'>) => PopulatedTransaction;
  getCorrectPoolBundle: () => PoolBundleInterface | LendingPoolBundleInterface;
  estimateGasLimit: (tx: PopulatedTransaction, chainId?: number) => Promise<PopulatedTransaction>;
}

export const createPoolSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  PoolSlice
> = (_, get) => {
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
    getCorrectPoolBundle() {
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
    },
    generateApproval: (args: ApproveType, opts = {}) => {
      const provider = get().jsonRpcProvider(opts.chainId);
      const tokenERC20Service = new ERC20Service(provider);
      const amount = opts.amount ?? MAX_UINT_AMOUNT;
      return tokenERC20Service.approveTxData({ ...args, amount });
    },
    supply: (args: Omit<LPSupplyParamsType, 'user'>) => {
      const poolBundle = get().getCorrectPoolBundle();
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
      const poolBundle = get().getCorrectPoolBundle() as PoolBundle;
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
    borrow: (args: Omit<LPBorrowParamsType, 'user'>) => {
      const poolBundle = get().getCorrectPoolBundle();
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
    generateCreditDelegationSignatureRequest: async ({
      amount,
      deadline,
      underlyingAsset,
      spender,
    }) => {
      const user = get().account;
      const { getTokenData } = new ERC20Service(get().jsonRpcProvider());

      const { name } = await getTokenData(underlyingAsset);
      const chainId = get().currentChainId;

      const erc20_2612Service = new ERC20_2612Service(get().jsonRpcProvider());

      const nonce = await erc20_2612Service.getNonce({
        token: underlyingAsset,
        owner: user,
      });

      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          DelegationWithSig: [
            { name: 'delegatee', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'DelegationWithSig' as const,
        domain: {
          name,
          version: '1',
          chainId: chainId,
          verifyingContract: underlyingAsset,
        },
        message: {
          delegatee: spender,
          value: amount,
          nonce,
          deadline,
        },
      };

      return JSON.stringify(typedData);
    },
    debtSwitch: ({
      currentRateMode,
      poolReserve,
      amountToSwap,
      targetReserve,
      amountToReceive,
      isMaxSelected,
      txCalldata,
      augustus,
      signatureParams,
    }) => {
      const user = get().account;
      const provider = get().jsonRpcProvider();
      const currentMarketData = get().currentMarketData;
      const debtSwitchService = new DebtSwitchAdapterService(
        provider,
        currentMarketData.addresses.DEBT_SWITCH_ADAPTER ?? ''
      );
      let signatureDeconstruct: PermitSignature = {
        amount: signatureParams?.amount ?? '0',
        deadline: signatureParams?.deadline?.toString() ?? '0',
        v: 0,
        r: '0x0000000000000000000000000000000000000000000000000000000000000000',
        s: '0x0000000000000000000000000000000000000000000000000000000000000000',
      };

      if (signatureParams) {
        const sig: Signature = splitSignature(signatureParams.signature);
        signatureDeconstruct = {
          ...signatureDeconstruct,
          v: sig.v,
          r: sig.r,
          s: sig.s,
        };
      }
      return debtSwitchService.debtSwitch({
        user,
        debtAssetUnderlying: poolReserve.underlyingAsset,
        debtRepayAmount: isMaxSelected ? MAX_UINT_AMOUNT : amountToSwap,
        debtRateMode: currentRateMode,
        newAssetUnderlying: targetReserve.underlyingAsset,
        newAssetDebtToken: targetReserve.variableDebtTokenAddress,
        maxNewDebtAmount: amountToReceive,
        extraCollateralAmount: '0',
        extraCollateralAsset: '0x0000000000000000000000000000000000000000',
        repayAll: isMaxSelected,
        txCalldata,
        augustus,
        creditDelegationPermit: {
          deadline: signatureDeconstruct.deadline,
          value: signatureDeconstruct.amount,
          v: signatureDeconstruct.v,
          r: signatureDeconstruct.r,
          s: signatureDeconstruct.s,
        },
        collateralPermit: {
          deadline: '0',
          value: '0',
          v: 0,
          r: '0x0000000000000000000000000000000000000000000000000000000000000000',
          s: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
      });
    },
    repay: ({ repayWithATokens, amountToRepay, poolAddress, debtType, encodedTxData }) => {
      const poolBundle = get().getCorrectPoolBundle();
      const currentAccount = get().account;
      if (poolBundle instanceof PoolBundle) {
        if (repayWithATokens) {
          return poolBundle.repayWithATokensTxBuilder.generateTxData({
            user: currentAccount,
            reserve: poolAddress,
            amount: amountToRepay,
            useOptimizedPath: get().useOptimizedPath(),
            rateMode: debtType,
            encodedTxData,
          });
        } else {
          return poolBundle.repayTxBuilder.generateTxData({
            user: currentAccount,
            reserve: poolAddress,
            amount: amountToRepay,
            useOptimizedPath: get().useOptimizedPath(),
            interestRateMode: debtType,
            encodedTxData,
          });
        }
      } else {
        const lendingPool = poolBundle as LendingPoolBundle;
        return lendingPool.repayTxBuilder.generateTxData({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToRepay,
          interestRateMode: debtType,
        });
      }
    },
    repayWithPermit: ({
      reserve,
      amount,
      interestRateMode,
      deadline,
      signature,
      encodedTxData,
    }) => {
      const poolBundle = get().getCorrectPoolBundle() as PoolBundle;
      const currentAccount = get().account;
      const stringSignature = utils.joinSignature(signature);
      return poolBundle.repayTxBuilder.generateSignedTxData({
        user: currentAccount,
        reserve,
        amount,
        useOptimizedPath: get().useOptimizedPath(),
        interestRateMode,
        deadline,
        signature: stringSignature,
        encodedTxData,
      });
    },
    encodeRepayWithPermitParams: ({ reserve, amount, interestRateMode, deadline, signature }) => {
      const poolBundle = get().getCorrectPoolBundle() as PoolBundle;
      const stringSignature = utils.joinSignature(signature);
      return poolBundle.repayTxBuilder.encodeRepayWithPermitParams({
        reserve,
        amount,
        interestRateMode,
        deadline,
        signature: stringSignature,
      });
    },
    encodeRepayParams: ({ amountToRepay, poolAddress, debtType, repayWithATokens }) => {
      const poolBundle = get().getCorrectPoolBundle() as PoolBundle;
      if (repayWithATokens) {
        return poolBundle.repayWithATokensTxBuilder.encodeRepayWithATokensParams({
          reserve: poolAddress,
          amount: amountToRepay,
          rateMode: debtType,
        });
      } else {
        return poolBundle.repayTxBuilder.encodeRepayParams({
          reserve: poolAddress,
          amount: amountToRepay,
          interestRateMode: debtType,
        });
      }
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
    withdrawAndSwitch: ({
      poolReserve,
      targetReserve,
      isMaxSelected,
      amountToSwap,
      amountToReceive,
      augustus,
      signatureParams,
      txCalldata,
    }) => {
      const user = get().account;

      const provider = get().jsonRpcProvider();
      const currentMarketData = get().currentMarketData;

      const withdrawAndSwapService = new WithdrawAndSwitchAdapterService(
        provider,
        currentMarketData.addresses.WITHDRAW_SWITCH_ADAPTER
      );

      let signatureDeconstruct: PermitSignature = {
        amount: signatureParams?.amount ?? '0',
        deadline: signatureParams?.deadline?.toString() ?? '0',
        v: 0,
        r: '0x0000000000000000000000000000000000000000000000000000000000000000',
        s: '0x0000000000000000000000000000000000000000000000000000000000000000',
      };

      if (signatureParams) {
        const sig: Signature = splitSignature(signatureParams.signature);
        signatureDeconstruct = {
          ...signatureDeconstruct,
          v: sig.v,
          r: sig.r,
          s: sig.s,
        };
      }

      return withdrawAndSwapService.withdrawAndSwitch({
        assetToSwitchFrom: poolReserve.underlyingAsset,
        assetToSwitchTo: targetReserve.underlyingAsset,
        switchAll: isMaxSelected,
        amountToSwitch: amountToSwap,
        minAmountToReceive: amountToReceive,
        user,
        augustus,
        switchCallData: txCalldata,
        permitParams: signatureDeconstruct,
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
    claimRewards: async ({ formattedReserves, selectedReward }) => {
      // TODO: think about moving timestamp from hook to EventEmitter
      const currentAccount = get().account;

      const allReserves: string[] = [];
      formattedReserves.forEach((reserve) => {
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
    generateSignatureRequest: async ({ token, amount, deadline, spender }, opts = {}) => {
      const v3Tokens = [
        AaveV3Ethereum.ASSETS.AAVE.UNDERLYING.toLowerCase(),
        AaveV3Ethereum.ASSETS.AAVE.A_TOKEN.toLowerCase(),
        AaveSafetyModule.STK_AAVE.toLowerCase(),
      ];

      const provider = get().jsonRpcProvider(opts.chainId);

      let name = '';
      let version = '1';
      if (v3Tokens.includes(token.toLowerCase())) {
        const aaveV3TokenService = new AaveTokenV3Service(token, provider);
        const domain = await aaveV3TokenService.getEip712Domain();
        name = domain.name;
        version = domain.version;
      } else {
        const tokenERC20Service = new ERC20Service(provider);
        name = (await tokenERC20Service.getTokenData(token)).name;
      }

      const { chainId } = await provider.getNetwork();
      const tokenERC2612Service = new ERC20_2612Service(provider);
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
          version,
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
    estimateGasLimit: async (tx: PopulatedTransaction, chainId?: number) => {
      const provider = get().jsonRpcProvider(chainId);
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
