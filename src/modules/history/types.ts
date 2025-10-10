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
};

// Combine the SDK types with the CoWswap types
export type TransactionHistoryItemUnion =
  | UserTransactionItem
  | TransactionHistoryItem<ActionFields['CowSwap']>
  | TransactionHistoryItem<ActionFields['CowCollateralSwap']>;

//GUARDS
export const isSDKTransaction = (txn: TransactionHistoryItemUnion): txn is UserTransactionItem => {
  return '__typename' in txn;
};

export const isCowSwapTransaction = (
  txn: TransactionHistoryItemUnion
): txn is
  | TransactionHistoryItem<ActionFields['CowSwap']>
  | TransactionHistoryItem<ActionFields['CowCollateralSwap']> => {
  return 'action' in txn && (txn.action === 'CowSwap' || txn.action === 'CowCollateralSwap');
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
      return FilterOptions.COWSWAP;
    default:
      return 8; // Unknown
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
