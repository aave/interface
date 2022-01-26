import { ComputedReserveData } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { ReserveIncentiveResponse } from '../../../../hooks/app-data-provider/useIncentiveData';

export type BorrowedPositionsItem = {
  // onSwitchToggle: () => void;
  isActive: boolean;
  isFrozen: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  borrowRate: string;
  vIncentives: ReserveIncentiveResponse[];
  sIncentives: ReserveIncentiveResponse[];
  borrowRateMode: string;
  currentBorrows: string;
  currentBorrowsUSD: string;
  // repayLink: string;
  // borrowLink: string;
  reserve: Pick<ComputedReserveData, 'symbol' | 'underlyingAsset' | 'id'>;
  index?: number;
};
