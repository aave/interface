import { InterestRate } from '@aave/contract-helpers';
import { BorrowAssetsItem } from 'src/modules/dashboard/lists/BorrowAssetsList/types';
import { SupplyAssetsItem } from 'src/modules/dashboard/lists/SupplyAssetsList/types';

// Sorting keys
import {
  ComputedReserveData,
  ComputedUserReserveData,
} from '../hooks/app-data-provider/useAppDataProvider';

// Helpers
export const DASHBOARD_LIST_COLUMN_WIDTHS = {
  ASSET: 130,
  BUTTONS: 160,
  CELL: 130,
};

// Note: Create a single type that works with all four dashboards list and all 8 list item components
// Each list item may need a combination of a few types but not all, i.e. positions vs assets and supplied vs borrowed
type DashboardReserveData = ComputedUserReserveData &
  ComputedReserveData &
  BorrowAssetsItem &
  SupplyAssetsItem;

export type DashboardReserve = DashboardReserveData & {
  // Additions
  borrowRateMode: InterestRate; // for the borrow positions list
  // Overrides
  reserve: ComputedReserveData;
};

/**
 * `borrowAPY` is derived inside the row component (`BorrowedPositionsListItem`), so it is not a
 * field on the objects sorted here — reading it directly compares two `undefined`s. Map it back
 * onto the reserve value it is computed from.
 */
const numericValue = (position: DashboardReserve, sortName: string): number =>
  sortName === 'borrowAPY'
    ? Number(position.reserve.variableBorrowAPY)
    : Number(position[sortName as keyof DashboardReserve]);

const symbolOf = (position: DashboardReserve, sortPosition: string): string =>
  (sortPosition === 'position' ? position.reserve.symbol : position.symbol).toUpperCase();

export const handleSortDashboardReserves = (
  sortDesc: boolean,
  sortName: string,
  sortPosition: string,
  positions: DashboardReserve[],
  isBorrowedPosition?: boolean
): DashboardReserve[] => {
  // Direction is decided once and multiplied into each comparator, rather than mirrored across a
  // pair of functions that have to be edited in lockstep.
  const dir = sortDesc ? -1 : 1;
  // Sort a copy: `SuppliedPositionsList` and friends pass a memoised array straight in, and
  // sorting it in place would permanently reorder the list's own ordering — so clearing the sort
  // could never get back to it.
  const sorted = [...positions];

  if (sortName === 'symbol') {
    // Equal symbols keep returning 1 rather than 0, as they always have; `dir * 1` would reorder
    // ties when descending instead of leaving them alone.
    return sorted.sort((a, b) =>
      dir === 1
        ? symbolOf(a, sortPosition) < symbolOf(b, sortPosition)
          ? -1
          : 1
        : symbolOf(b, sortPosition) < symbolOf(a, sortPosition)
        ? -1
        : 1
    );
  }

  // Borrowed positions tie-break on borrow APY underneath the primary sort. It runs in the same
  // direction as that sort, and with no `sortName` it is the whole ordering — which is how the
  // APY column sorts at all, since its `borrowAPY` key does not resolve on these objects.
  if (isBorrowedPosition) {
    sorted.sort(
      (a, b) => dir * (Number(a.reserve.variableBorrowAPY) - Number(b.reserve.variableBorrowAPY))
    );
  }

  return sorted.sort((a, b) => dir * (numericValue(a, sortName) - numericValue(b, sortName)));
};
