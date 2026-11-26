export interface Variation<T> {
  current: T;
  after: T;
}

export interface MigrationAsset {
  symbol: string;
  name: string;
  address: string;
}

export interface EarnMigrationPosition {
  id: string;
  asset: MigrationAsset;
  supplied: { amount: string; usd: string };
  supplyApy: Variation<number>;
  projectedEarningsUSD: Variation<number>;
}

export interface BorrowMigrationPosition {
  id: string;
  chainId: number;
  marketName: string;
  netBalanceUSD: number;
  collateral: MigrationAsset[];
  collateralUSD: number;
  borrowed: MigrationAsset[];
  borrowedUSD: number;
  borrowApy?: Variation<number>;
  healthFactor: Variation<string>;
}
