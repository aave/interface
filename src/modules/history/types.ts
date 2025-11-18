import type {
  UserBorrowTransaction,
  UserLiquidationCallTransaction,
  UserRepayTransaction,
  UserSupplyTransaction,
  UserTransactionItem,
  UserUsageAsCollateralTransaction,
  UserWithdrawTransaction,
} from '@aave/graphql';
import { OrderStatus } from '@cowprotocol/cow-sdk';
import { SwapType } from 'src/components/transactions/Swap/types';

export enum ActionName {
  UserSupplyTransaction,
  UserWithdrawTransaction,
  UserBorrowTransaction,
  UserRepayTransaction,
  UserUsageAsCollateralTransaction,
  UserLiquidationCallTransaction,

  Swap,
  CollateralSwap,
  DebtSwap,
  RepayWithCollateral,
  WithdrawAndSwap,
}
export type TransactionHistoryItem<T = unknown> = {
  id: string;
  action: ActionName;
  timestamp: string;
} & T;

export type ReserveSubset = {
  symbol: string;
  decimals: number;
  underlyingAsset: string;
  name: string;
};

export type SwapSubset = {
  underlyingSrcToken: ReserveSubset;
  srcAToken?: boolean;
  underlyingDestToken: ReserveSubset;
  destAToken?: boolean;
  srcAmount: string;
  destAmount: string;
  status: OrderStatus;
  chainId: number;
};

export type ParaswapSubset = SwapSubset & {
  protocol: 'paraswap';
  txHash: string;
};

export type CowSwapSubset = SwapSubset & {
  protocol: 'cow';
  orderId: string;
  adapterInstanceAddress?: string; // Instance address for adapter-based swaps
  usedAdapter?: boolean; // Whether adapter was used
};

export type SwapActionFields = {
  [ActionName.Swap]: CowSwapSubset | ParaswapSubset;
  [ActionName.CollateralSwap]: CowSwapSubset | ParaswapSubset;
  [ActionName.DebtSwap]: CowSwapSubset | ParaswapSubset;
  [ActionName.RepayWithCollateral]: CowSwapSubset | ParaswapSubset;
  [ActionName.WithdrawAndSwap]: CowSwapSubset | ParaswapSubset;
};

export const isParaswapSubset = (
  subset: SwapSubset | TransactionHistoryItemUnion
): subset is ParaswapSubset => {
  return 'txHash' in subset;
};

export const isCowSwapSubset = (
  subset: SwapSubset | TransactionHistoryItemUnion
): subset is CowSwapSubset => {
  return 'orderId' in subset;
};

// Combine the SDK types with the CoWswap types
export type TransactionHistoryItemUnion =
  | UserTransactionItem
  | TransactionHistoryItem<SwapActionFields[ActionName.Swap]>
  | TransactionHistoryItem<SwapActionFields[ActionName.CollateralSwap]>
  | TransactionHistoryItem<SwapActionFields[ActionName.DebtSwap]>
  | TransactionHistoryItem<SwapActionFields[ActionName.RepayWithCollateral]>
  | TransactionHistoryItem<SwapActionFields[ActionName.WithdrawAndSwap]>;

export const transactionHistoryItemTypeToSwapType = (type: ActionName): SwapType | undefined => {
  switch (type) {
    case ActionName.Swap:
      return SwapType.Swap;
    case ActionName.CollateralSwap:
      return SwapType.CollateralSwap;
    case ActionName.DebtSwap:
      return SwapType.DebtSwap;
    case ActionName.RepayWithCollateral:
      return SwapType.RepayWithCollateral;
    case ActionName.WithdrawAndSwap:
      return SwapType.WithdrawAndSwap;
    default:
      return undefined;
  }
};

export const swapTypeToTransactionHistoryItemType = (
  swapType: SwapType
): ActionName | undefined => {
  switch (swapType) {
    case SwapType.Swap:
      return ActionName.Swap;
    case SwapType.CollateralSwap:
      return ActionName.CollateralSwap;
    case SwapType.DebtSwap:
      return ActionName.DebtSwap;
    case SwapType.RepayWithCollateral:
      return ActionName.RepayWithCollateral;
    case SwapType.WithdrawAndSwap:
      return ActionName.WithdrawAndSwap;
    default:
      return undefined;
  }
};

//GUARDS
export const isSDKTransaction = (txn: TransactionHistoryItemUnion): txn is UserTransactionItem => {
  return '__typename' in txn;
};

export const isSwapTransaction = (
  txn: TransactionHistoryItemUnion
): txn is
  | TransactionHistoryItem<SwapActionFields[ActionName.Swap]>
  | TransactionHistoryItem<SwapActionFields[ActionName.CollateralSwap]>
  | TransactionHistoryItem<SwapActionFields[ActionName.DebtSwap]>
  | TransactionHistoryItem<SwapActionFields[ActionName.RepayWithCollateral]>
  | TransactionHistoryItem<SwapActionFields[ActionName.WithdrawAndSwap]> => {
  return (
    'action' in txn &&
    (txn.action === ActionName.Swap ||
      txn.action === ActionName.CollateralSwap ||
      txn.action === ActionName.DebtSwap ||
      txn.action === ActionName.RepayWithCollateral ||
      txn.action === ActionName.WithdrawAndSwap) &&
    (isCowSwapSubset(txn) || isParaswapSubset(txn))
  );
};

export const hasReserve = (
  txn: TransactionHistoryItemUnion
): txn is
  | UserSupplyTransaction
  | UserWithdrawTransaction
  | UserBorrowTransaction
  | UserRepayTransaction
  | UserUsageAsCollateralTransaction => {
  return isSDKTransaction(txn) && txn.__typename !== 'UserLiquidationCallTransaction';
};

export const hasAmount = (
  txn: TransactionHistoryItemUnion
): txn is
  | UserSupplyTransaction
  | UserWithdrawTransaction
  | UserBorrowTransaction
  | UserRepayTransaction => {
  return isSDKTransaction(txn) && 'amount' in txn;
};

export const hasAmountAndReserve = (
  txn: TransactionHistoryItemUnion
): txn is
  | UserSupplyTransaction
  | UserWithdrawTransaction
  | UserBorrowTransaction
  | UserRepayTransaction => {
  return hasAmount(txn) && hasReserve(txn);
};

export const hasCollateralReserve = (
  txn: TransactionHistoryItemUnion
): txn is UserLiquidationCallTransaction => {
  return isSDKTransaction(txn) && txn.__typename === 'UserLiquidationCallTransaction';
};

export const hasPrincipalReserve = (
  txn: TransactionHistoryItemUnion
): txn is UserLiquidationCallTransaction => {
  return hasCollateralReserve(txn);
};

export const hasSrcOrDestToken = (txn: TransactionHistoryItemUnion): boolean => {
  return (
    'action' in txn &&
    (txn.action === ActionName.Swap ||
      txn.action === ActionName.CollateralSwap ||
      txn.action === ActionName.DebtSwap ||
      txn.action === ActionName.RepayWithCollateral ||
      txn.action === ActionName.WithdrawAndSwap)
  );
};

// FILTERS
export enum FilterOptions {
  SUPPLY,
  BORROW,
  WITHDRAW,
  REPAY,
  RATECHANGE,
  COLLATERALCHANGE,
  LIQUIDATION,
  SWAP,
  COLLATERAL_SWAP,
  DEBT_SWAP,
  REPAY_WITH_COLLATERAL,
  WITHDRAW_AND_SWAP,
}

export interface HistoryFilters {
  searchQuery: string;
  filterQuery: FilterOptions[];
}

export const actionFilterMap = (action: ActionName): number => {
  switch (action) {
    case ActionName.UserSupplyTransaction:
      return FilterOptions.SUPPLY;
    case ActionName.UserBorrowTransaction:
      return FilterOptions.BORROW;
    case ActionName.UserWithdrawTransaction:
      return FilterOptions.WITHDRAW;
    case ActionName.UserRepayTransaction:
      return FilterOptions.REPAY;
    case ActionName.UserUsageAsCollateralTransaction:
      return FilterOptions.COLLATERALCHANGE;
    case ActionName.CollateralSwap:
      return FilterOptions.COLLATERAL_SWAP;
    case ActionName.UserLiquidationCallTransaction:
      return FilterOptions.LIQUIDATION;
    case ActionName.Swap:
      return FilterOptions.SWAP;
    case ActionName.DebtSwap:
      return FilterOptions.DEBT_SWAP;
    case ActionName.RepayWithCollateral:
      return FilterOptions.REPAY_WITH_COLLATERAL;
    case ActionName.WithdrawAndSwap:
      return FilterOptions.WITHDRAW_AND_SWAP;
  }
};

//RE-EXPORT TYPES
export type {
  Currency,
  DecimalValue,
  MarketInfo,
  ReserveInfo,
  TokenAmount,
  UserBorrowTransaction,
  UserLiquidationCallTransaction,
  UserRepayTransaction,
  UserSupplyTransaction,
  UserTransactionItem,
  UserUsageAsCollateralTransaction,
  UserWithdrawTransaction,
} from '@aave/graphql';
