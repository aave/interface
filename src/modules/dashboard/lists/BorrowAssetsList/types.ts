import { ReserveIncentiveResponse } from '../../../../hooks/app-data-provider/useIncentiveData';

export type BorrowAssetsItem = {
  id: string;
  symbol: string;
  underlyingAsset: string;
  currentBorrows: number | string;
  currentBorrowsInUSD: number | string;
  stableBorrowRate: number | string;
  variableBorrowRate: number | string;
  availableBorrows: number | string;
  availableBorrowsInUSD: number | string;
  stableBorrowRateEnabled?: boolean;
  userId?: string;
  isFreezed?: boolean;
  vIncentives: ReserveIncentiveResponse[];
  sIncentives: ReserveIncentiveResponse[];
  aIncentives: ReserveIncentiveResponse[];
  borrowCap: string;
  borrowableInIsolation: boolean;
  totalBorrows: string;
  totalLiquidityUSD: string;
  borrowingEnabled: boolean;
  isActive: boolean;
  eModeCategoryId: number;
};
