export type TransactionHistoryItem<T = unknown> = {
  id: string;
  txHash: string;
  action: string;
  pool: {
    id: string;
  };
  timestamp: number;
} & T;

export type ReserveSubset = {
  symbol: string;
  decimals: number;
  underlyingAsset: string;
  name: string;
};

export type ActionFields = {
  Supply: {
    reserve: ReserveSubset;
    amount: string;
    assetPriceUSD: string;
  };
  Deposit: {
    reserve: ReserveSubset;
    amount: string;
    assetPriceUSD: string;
  };
  Borrow: {
    reserve: ReserveSubset;
    amount: string;
    assetPriceUSD: string;
  };
  Repay: {
    reserve: ReserveSubset;
    amount: string;
    assetPriceUSD: string;
  };
  RedeemUnderlying: {
    reserve: ReserveSubset;
    amount: string;
    assetPriceUSD: string;
  };
  LiquidationCall: {
    collateralReserve: ReserveSubset;
    collateralAmount: string;
    principalReserve: ReserveSubset;
    principalAmount: string;
    borrowAssetPriceUSD: string;
    collateralAssetPriceUSD: string;
  };
  SwapBorrowRate: {
    reserve: ReserveSubset;
    borrowRateModeFrom: string;
    borrowRateModeTo: string;
    stableBorrowRate: string;
    variableBorrowRate: string;
    assetPriceUSD: string;
  };
  Swap: {
    reserve: ReserveSubset;
    borrowRateModeFrom: number;
    borrowRateModeTo: number;
    stableBorrowRate: string;
    variableBorrowRate: string;
    assetPriceUSD: string;
  };
  UsageAsCollateral: {
    reserve: ReserveSubset;
    fromState: boolean;
    toState: boolean;
    assetPriceUSD: string;
  };
};

export type TransactionHistoryItemUnion =
  | TransactionHistoryItem<ActionFields['Supply']>
  | TransactionHistoryItem<ActionFields['Deposit']>
  | TransactionHistoryItem<ActionFields['Borrow']>
  | TransactionHistoryItem<ActionFields['Repay']>
  | TransactionHistoryItem<ActionFields['RedeemUnderlying']>
  | TransactionHistoryItem<ActionFields['LiquidationCall']>
  | TransactionHistoryItem<ActionFields['SwapBorrowRate']>
  | TransactionHistoryItem<ActionFields['Swap']>
  | TransactionHistoryItem<ActionFields['UsageAsCollateral']>;

// Type guards
export const hasCollateralReserve = (
  txn: TransactionHistoryItemUnion
): txn is TransactionHistoryItem<ActionFields['LiquidationCall']> => {
  return (
    (txn as TransactionHistoryItem<ActionFields['LiquidationCall']>).collateralReserve !== undefined
  );
};

export const hasPrincipalReserve = (
  txn: TransactionHistoryItemUnion
): txn is TransactionHistoryItem<ActionFields['LiquidationCall']> => {
  return (
    (txn as TransactionHistoryItem<ActionFields['LiquidationCall']>).principalReserve !== undefined
  );
};

export const hasReserve = (
  txn: TransactionHistoryItemUnion
): txn is
  | TransactionHistoryItem<ActionFields['Supply']>
  | TransactionHistoryItem<ActionFields['Deposit']>
  | TransactionHistoryItem<ActionFields['Borrow']>
  | TransactionHistoryItem<ActionFields['Repay']>
  | TransactionHistoryItem<ActionFields['RedeemUnderlying']>
  | TransactionHistoryItem<ActionFields['SwapBorrowRate']>
  | TransactionHistoryItem<ActionFields['Swap']>
  | TransactionHistoryItem<ActionFields['UsageAsCollateral']> => {
  return (txn as TransactionHistoryItem<ActionFields['Supply']>).reserve !== undefined;
};

export const hasAmountAndReserve = (
  txn: TransactionHistoryItemUnion
): txn is
  | TransactionHistoryItem<ActionFields['Supply']>
  | TransactionHistoryItem<ActionFields['Deposit']>
  | TransactionHistoryItem<ActionFields['Borrow']>
  | TransactionHistoryItem<ActionFields['Repay']>
  | TransactionHistoryItem<ActionFields['RedeemUnderlying']> => {
  return (
    (txn as TransactionHistoryItem<ActionFields['Supply']>).amount !== undefined &&
    (txn as TransactionHistoryItem<ActionFields['Supply']>).reserve !== undefined
  );
};

export const hasSwapBorrowRate = (
  txn: TransactionHistoryItemUnion
): txn is
  | TransactionHistoryItem<ActionFields['SwapBorrowRate']>
  | TransactionHistoryItem<ActionFields['Swap']> => {
  return (
    (txn as TransactionHistoryItem<ActionFields['SwapBorrowRate']>).variableBorrowRate !==
      undefined &&
    (txn as TransactionHistoryItem<ActionFields['SwapBorrowRate']>).stableBorrowRate !== undefined
  );
};

export enum FilterOptions {
  SUPPLY,
  BORROW,
  WITHDRAW,
  REPAY,
  RATECHANGE,
  COLLATERALCHANGE,
  LIQUIDATION,
}

export interface HistoryFilters {
  searchQuery: string;
  filterQuery: FilterOptions[];
}

export const actionFilterMap = (action: string): number => {
  switch (action) {
    case 'Deposit': // v2
    case 'Supply': // v3
      return 0;
    case 'Borrow':
      return 1;
    case 'RedeemUnderlying':
      return 2;
    case 'Repay':
      return 3;
    case 'Swap': // v2
    case 'SwapBorrowRate': // v3
      return 4;
    case 'UsageAsCollateral':
      return 5;
    case 'LiquidationCall':
      return 6;
    default:
      return 7;
  }
};
