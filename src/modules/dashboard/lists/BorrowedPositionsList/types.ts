import { ComputedReserveData } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { ReserveIncentiveResponse } from '../../../../hooks/app-data-provider/useIncentiveData';

export type BorrowedPositionsItem = {
  isActive: boolean;
  isFrozen: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  borrowRate: string;
  vIncentives: ReserveIncentiveResponse[];
  sIncentives: ReserveIncentiveResponse[];
  borrowRateMode: string;
  reserve: Pick<ComputedReserveData, 'symbol' | 'iconSymbol' | 'underlyingAsset' | 'id'>;
};
