import { ComputedUserReserve } from '@aave/math-utils';

import { ComputedReserveData } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { ReserveIncentiveResponse } from '../../../../hooks/app-data-provider/useIncentiveData';

export type SuppliedPositionsItem = {
  // onToggleSwitch: () => void;
  isActive: boolean;
  isFrozen: boolean;
  reserve: Pick<
    ComputedReserveData,
    'id' | 'symbol' | 'name' | 'liquidityRate' | 'underlyingAsset' | 'iconSymbol'
  >;
  aIncentives: ReserveIncentiveResponse[];
  /**
   * false when isolation mode makes it impossible to use asset as collateral
   */
  canBeEnabledAsCollateral: boolean;
  isIsolated: boolean;
  // swapLink: string;
  // depositLink: string;
  // withdrawLink: string;
} & Pick<
  ComputedUserReserve,
  'usageAsCollateralEnabledOnUser' | 'underlyingBalance' | 'underlyingBalanceUSD'
>;
