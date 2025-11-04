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

export type TransactionHistoryItem<T = unknown> = {
  id: string;
  action: string;
  timestamp: string;
} & T;

export type ReserveSubset = {
  symbol: string;
  decimals: number;
  underlyingAsset: string;
  name: string;
};

export type CowSwapSubset = {
  underlyingSrcToken: ReserveSubset;
  srcAToken?: boolean;
  underlyingDestToken: ReserveSubset;
  destAToken?: boolean;
  srcAmount: string;
  destAmount: string;
  status: OrderStatus;
  orderId: string;
  chainId: number;
};

export type ActionFields = {
  CowSwap: CowSwapSubset;
  CowCollateralSwap: CowSwapSubset;
  CowDebtSwap: CowSwapSubset;
  CowRepayWithCollateral: CowSwapSubset;
  CowWithdrawAndSwap: CowSwapSubset;
};

// Combine the SDK types with the CoWswap types
export type TransactionHistoryItemUnion =
  | UserTransactionItem
  | TransactionHistoryItem<ActionFields['CowSwap']>
  | TransactionHistoryItem<ActionFields['CowCollateralSwap']>
  | TransactionHistoryItem<ActionFields['CowDebtSwap']>
  | TransactionHistoryItem<ActionFields['CowRepayWithCollateral']>
  | TransactionHistoryItem<ActionFields['CowWithdrawAndSwap']>;

export const transactionHistoryItemTypeToSwapType = (type: string): SwapType | undefined => {
  switch (type) {
    case 'CowSwap':
      return SwapType.Swap;
    case 'CowCollateralSwap':
      return SwapType.CollateralSwap;
    case 'CowDebtSwap':
      return SwapType.DebtSwap;
    case 'CowRepayWithCollateral':
      return SwapType.RepayWithCollateral;
    case 'CowWithdrawAndSwap':
      return SwapType.WithdrawAndSwap;
    default:
      return undefined;
  }
};

export const swapTypeToTransactionHistoryItemType = (swapType: SwapType): string | undefined => {
  switch (swapType) {
    case SwapType.Swap:
      return 'CowSwap';
    case SwapType.CollateralSwap:
      return 'CowCollateralSwap';
    case SwapType.DebtSwap:
      return 'CowDebtSwap';
    case SwapType.RepayWithCollateral:
      return 'CowRepayWithCollateral';
    case SwapType.WithdrawAndSwap:
      return 'CowWithdrawAndSwap';
    default:
      return undefined;
  }
};

//GUARDS
export const isSDKTransaction = (txn: TransactionHistoryItemUnion): txn is UserTransactionItem => {
  return '__typename' in txn;
};

export const isCowSwapTransaction = (
  txn: TransactionHistoryItemUnion
): txn is
  | TransactionHistoryItem<ActionFields['CowSwap']>
  | TransactionHistoryItem<ActionFields['CowCollateralSwap']>
  | TransactionHistoryItem<ActionFields['CowDebtSwap']>
  | TransactionHistoryItem<ActionFields['CowRepayWithCollateral']>
  | TransactionHistoryItem<ActionFields['CowWithdrawAndSwap']> => {
  return (
    'action' in txn &&
    (txn.action === 'CowSwap' ||
      txn.action === 'CowCollateralSwap' ||
      txn.action === 'CowDebtSwap' ||
      txn.action === 'CowRepayWithCollateral' ||
      txn.action === 'CowWithdrawAndSwap')
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

export const hasSrcOrDestToken = (
  txn: TransactionHistoryItemUnion
): txn is
  | TransactionHistoryItem<ActionFields['CowSwap']>
  | TransactionHistoryItem<ActionFields['CowCollateralSwap']> => {
  return isCowSwapTransaction(txn);
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
  COWSWAP,
}

export interface HistoryFilters {
  searchQuery: string;
  filterQuery: FilterOptions[];
}

export const actionFilterMap = (action: string): number => {
  switch (action) {
    case 'UserSupplyTransaction':
      return FilterOptions.SUPPLY;
    case 'UserBorrowTransaction':
      return FilterOptions.BORROW;
    case 'UserWithdrawTransaction':
      return FilterOptions.WITHDRAW;
    case 'UserRepayTransaction':
      return FilterOptions.REPAY;
    case 'UserUsageAsCollateralTransaction':
    case 'CowCollateralSwap':
      return FilterOptions.COLLATERALCHANGE;
    case 'UserLiquidationCallTransaction':
      return FilterOptions.LIQUIDATION;
    case 'CowSwap':
      return 7;
    case 'CowDebtSwap':
      return 8;
    case 'CowRepayWithCollateral':
      return 9;
    case 'CowWithdrawAndSwap':
      return 10;
    default:
      return 11;
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
