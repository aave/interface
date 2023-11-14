import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { FormattedReservesAndIncentives } from 'src/hooks/pool/usePoolFormattedReserves';

export type BorrowedPositionsItem = {
  isActive: boolean;
  isFrozen: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  borrowRate: string;
  vIncentives: ReserveIncentiveResponse[];
  sIncentives: ReserveIncentiveResponse[];
  borrowRateMode: string;
  reserve: Pick<FormattedReservesAndIncentives, 'symbol' | 'iconSymbol' | 'underlyingAsset' | 'id'>;
};
