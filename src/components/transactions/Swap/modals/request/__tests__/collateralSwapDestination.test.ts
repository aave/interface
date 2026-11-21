import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { EmodeCategory } from 'src/helpers/types';

import { canBeCollateralSwapDestination } from '../collateralSwapDestination';

const reserve = (overrides: Record<string, unknown> = {}) =>
  ({
    symbol: 'EURe',
    baseLTVasCollateral: '0',
    eModes: [],
    ...overrides,
  } as unknown as ComputedReserveData);

const user = (overrides: Record<string, unknown> = {}) =>
  ({
    isInEmode: false,
    userEmodeCategoryId: 0,
    ...overrides,
  } as unknown as ExtendedFormattedUser);

const emodeEntry = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  collateralEnabled: true,
  ltvzeroEnabled: false,
  ...overrides,
});

const eModes = (overrides: Record<string, unknown> = {}) =>
  ({
    1: { isolated: false, ...((overrides[1] as Record<string, unknown>) || {}) },
    ...overrides,
  } as unknown as Record<number, EmodeCategory>);

describe('canBeCollateralSwapDestination', () => {
  it('excludes a zero-LTV reserve when the user is not in e-mode', () => {
    expect(canBeCollateralSwapDestination(reserve(), user(), eModes())).toBe(false);
  });

  it('keeps a non-zero-LTV reserve when the user is not in e-mode', () => {
    expect(
      canBeCollateralSwapDestination(reserve({ baseLTVasCollateral: '7500' }), user(), eModes())
    ).toBe(true);
  });

  it('keeps a zero base LTV asset that counts as collateral in the user e-mode category', () => {
    const r = reserve({ eModes: [emodeEntry()] });
    const u = user({ isInEmode: true, userEmodeCategoryId: 1 });
    expect(canBeCollateralSwapDestination(r, u, eModes())).toBe(true);
  });

  it('excludes a zero base LTV asset flagged ltvzero in the user e-mode category', () => {
    const r = reserve({ eModes: [emodeEntry({ ltvzeroEnabled: true })] });
    const u = user({ isInEmode: true, userEmodeCategoryId: 1 });
    expect(canBeCollateralSwapDestination(r, u, eModes())).toBe(false);
  });

  it('excludes an asset outside an isolated e-mode category even with non-zero base LTV', () => {
    const r = reserve({ baseLTVasCollateral: '7500', eModes: [] });
    const u = user({ isInEmode: true, userEmodeCategoryId: 1 });
    expect(canBeCollateralSwapDestination(r, u, eModes({ 1: { isolated: true } }))).toBe(false);
  });

  it('falls back to base LTV when there is no user', () => {
    expect(canBeCollateralSwapDestination(reserve(), undefined, eModes())).toBe(false);
    expect(
      canBeCollateralSwapDestination(reserve({ baseLTVasCollateral: '7500' }), undefined, eModes())
    ).toBe(true);
  });
});
