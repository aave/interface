import { ReserveWithProtocolIncentives } from '../MarketAssetsList';

/**
 * Whether the row should carry the "(Disabled)" note next to its borrow APY: borrowing is off for
 * the reserve, it isn't frozen (frozen has its own treatment), no E-Mode category re-enables it,
 * and there is existing debt to qualify. Shared so the desktop row and the mobile card can't drift.
 */
export const showBorrowingDisabledNote = (reserve: ReserveWithProtocolIncentives): boolean =>
  reserve.borrowInfo?.borrowingState === 'DISABLED' &&
  !reserve.isFrozen &&
  !reserve.eModeInfo?.some((eMode) => eMode.canBeBorrowed) &&
  reserve.borrowInfo.total.amount.value !== '0';
