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
