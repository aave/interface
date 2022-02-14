import { ReserveIncentiveResponse } from '../../../../hooks/app-data-provider/useIncentiveData';

export type BorrowAssetsItem = {
  id: string;
  symbol: string;
  name: string;
  iconSymbol: string;
  underlyingAsset: string;
  stableBorrowRate: number | string;
  variableBorrowRate: number | string;
  availableBorrows: number | string;
  availableBorrowsInUSD: number | string;
  stableBorrowRateEnabled?: boolean;
  isFreezed?: boolean;
  aIncentivesData?: ReserveIncentiveResponse[];
  vIncentivesData?: ReserveIncentiveResponse[];
  sIncentivesData?: ReserveIncentiveResponse[];
  borrowCap: string;
  borrowableInIsolation: boolean;
  totalBorrows: string;
  totalLiquidityUSD: string;
  borrowingEnabled: boolean;
  isActive: boolean;
  eModeCategoryId: number;
};
