import {
  ComputedReserveData,
  ComputedUserReserveData,
} from '../hooks/app-data-provider/useAppDataProvider';

// Dev this helper handles sorting across assets, supplied positions, borrowable assets, borrowed positions
// Some of the data structure is a bit different across each hence a few if elses

interface Positions extends ComputedUserReserveData, ComputedReserveData {
  borrowRateMode: string;
}

export const positionSortLogic = (
  sortDesc: boolean,
  sortName: string,
  sortPosition: string,
  positions: Array<Positions>, // Note: due to different objects on positions vs assets
  isBorrowedPosition?: boolean
) => {
  if (sortDesc) {
    handleSortDesc(sortName, sortPosition, positions, isBorrowedPosition || false);
  } else {
    sortAsc(sortName, sortPosition, positions, isBorrowedPosition || false);
  }
};

const handleSortDesc = (
  sortName: string,
  sortPosition: string,
  positions: Array<Positions>,
  isBorrowedPosition: boolean
) => {
  if (sortName === 'symbol') {
    handleSymbolSort(true, sortPosition, positions);
  } else if (sortName === 'usageAsCollateralEnabledOnUser' || sortName === 'debt') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return positions.sort((a, b) => Number(a[sortName]) - Number(b[sortName]));
  } else {
    if (isBorrowedPosition) {
      positions.sort((a, b) =>
        a.borrowRateMode === 'Variable'
          ? Number(b.reserve.variableBorrowAPY) - Number(a.reserve.variableBorrowAPY)
          : Number(b.reserve.stableBorrowAPY) - Number(a.reserve.stableBorrowAPY)
      );
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return positions.sort((a, b) => a[sortName] - b[sortName]);
  }
};

const sortAsc = (
  sortName: string,
  sortPosition: string,
  positions: Array<Positions>,
  isBorrowedPosition: boolean
) => {
  if (sortName === 'symbol') {
    handleSymbolSort(false, sortPosition, positions);
  } else if (sortName === 'usageAsCollateralEnabledOnUser' || sortName === 'debt') {
    // NOTE parse to number for sorting
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    positions.sort((a, b) => Number(b[sortName]) - Number(a[sortName]));
  } else {
    // Note because borrow positions have extra logic we need to have this
    if (isBorrowedPosition) {
      positions.sort((a, b) =>
        a.borrowRateMode === 'Variable'
          ? Number(a.reserve.variableBorrowAPY) - Number(b.reserve.variableBorrowAPY)
          : Number(a.reserve.stableBorrowAPY) - Number(b.reserve.stableBorrowAPY)
      );
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return positions.sort((a, b) => b[sortName] - a[sortName]);
  }
};

const handleSymbolSort = (sortDesc: boolean, sortPosition: string, positions: Array<Positions>) => {
  // NOTE because the data structure is different we need to check for positions(supplied|borrowed)
  // if position then a.reserve.symbol otherwise a.symbol
  if (sortDesc) {
    if (sortPosition === 'position') {
      return positions.sort((a, b) =>
        a.reserve.symbol.toUpperCase() < b.reserve.symbol.toUpperCase() ? -1 : 1
      );
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return positions.sort((a, b) => (a.symbol.toUpperCase() < b.symbol.toUpperCase() ? -1 : 1));
  }

  if (sortPosition === 'position') {
    return positions.sort((a, b) =>
      b.reserve.symbol.toUpperCase() < a.reserve.symbol.toUpperCase() ? -1 : 1
    );
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return positions.sort((a, b) => (b.symbol.toUpperCase() < a.symbol.toUpperCase() ? -1 : 1));
};
