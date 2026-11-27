export interface Variation<T> {
  current: T;
  /** Missing when no V4 spoke is eligible for the position, so there is nothing to compare to. */
  after?: T;
}

export interface MigrationAsset {
  symbol: string;
  name: string;
  address: string;
}

export interface EarnMigrationPosition {
  id: string;
  /** False when no V4 spoke is eligible for the position. Defaults to migratable. */
  canMigrate?: boolean;
  asset: MigrationAsset;
  marketName: string;
  supplied: { amount: string; usd: string };
  supplyApy?: Variation<number>;
  projectedEarningsUSD?: Variation<number>;
}

export interface BorrowMigrationPosition {
  id: string;
  /** False when no V4 spoke is eligible for the position. Defaults to migratable. */
  canMigrate?: boolean;
  chainId: number;
  marketName: string;
  netBalanceUSD?: number;
  collateral: MigrationAsset[];
  collateralUSD: number;
  borrowed: MigrationAsset[];
  borrowedUSD: number;
  borrowApy?: Variation<number>;
  healthFactor?: Variation<string>;
}
