import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';

import { replaceUnderscoresWithSpaces } from './utils';

type EModeOnlyBorrowReserve = Pick<
  ReserveWithId,
  'borrowInfo' | 'eModeInfo' | 'isFrozen' | 'isPaused'
>;

/**
 * Labels of the E-Mode categories a reserve can be borrowed in when borrowing is globally disabled
 * for it (v3.6+ pools let an E-Mode re-enable a disabled reserve). Empty when the reserve is
 * borrowable outside E-Mode, not borrowable at all, or frozen/paused (those have their own
 * treatment). Trusts the backend's `canBeBorrowed`, which already accounts for the pool revision.
 * Labels have underscores replaced with spaces, matching ReserveEModePanel.
 * Shared so the markets row, the mobile card and the reserve page can't drift.
 */
export const getBorrowableOnlyInEModeLabels = (reserve: EModeOnlyBorrowReserve): string[] => {
  if (reserve.borrowInfo?.borrowingState !== 'DISABLED' || reserve.isFrozen || reserve.isPaused) {
    return [];
  }
  return (reserve.eModeInfo ?? [])
    .filter((eMode) => eMode.canBeBorrowed)
    .map((eMode) => replaceUnderscoresWithSpaces(eMode.label) ?? eMode.label);
};
