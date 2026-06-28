import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from '../../hooks/app-data-provider/useAppDataProvider';
import {
  assetCanBeBorrowedByUser,
  assetIsBorrowableOnMarket,
} from '../getMaxAmountAvailableToBorrow';

const baseReserve = {
  borrowingEnabled: false,
  isActive: true,
  borrowableInIsolation: false,
  isFrozen: false,
  isPaused: false,
  eModes: [{ id: 1, borrowingEnabled: true }],
} as unknown as ComputedReserveData;

describe('assetIsBorrowableOnMarket', () => {
  it('returns true when borrowingEnabled is true', () => {
    expect(assetIsBorrowableOnMarket({ borrowingEnabled: true, eModes: [] })).toBe(true);
  });

  it('returns true when borrowable in any e-mode', () => {
    expect(
      assetIsBorrowableOnMarket({
        borrowingEnabled: false,
        eModes: [{ id: 1, borrowingEnabled: true }],
      })
    ).toBe(true);
  });

  it('returns false when not borrowable in normal mode or e-mode', () => {
    expect(
      assetIsBorrowableOnMarket({
        borrowingEnabled: false,
        eModes: [{ id: 1, borrowingEnabled: false }],
      })
    ).toBe(false);
  });
});

describe('assetCanBeBorrowedByUser', () => {
  it('allows e-mode users to borrow when their category permits it', () => {
    expect(
      assetCanBeBorrowedByUser(baseReserve, {
        isInEmode: true,
        userEmodeCategoryId: 1,
      } as unknown as ExtendedFormattedUser)
    ).toBe(true);
  });
});
