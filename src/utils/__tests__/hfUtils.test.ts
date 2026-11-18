import { ComputedUserReserve, valueToBigNumber } from '@aave/math-utils';
import { EmodeCategory } from 'src/helpers/types';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';

import { calculateHFAfterSupply, calculateHFAfterSwap } from '../hfUtils';

jest.mock('src/hooks/app-data-provider/useAppDataProvider', () => ({}));

// tBTC (frozen, LTV 0, LT 0.75) and WBTC (LTV 0.73, LT 0.78), both priced at 1.
const reserve = (underlyingAsset: string, baseLTVasCollateral: string, lt: string) =>
  ({
    underlyingAsset,
    baseLTVasCollateral,
    reserveLiquidationThreshold: lt === '0' ? '0' : '7500',
    formattedReserveLiquidationThreshold: lt,
    formattedPriceInMarketReferenceCurrency: '1',
    isIsolated: false,
    eModes: [],
  } as unknown as ComputedReserveData);

const TBTC = reserve('tbtc', '0', '0.75');
const WBTC = reserve('wbtc', '7300', '0.78');

// 100 tBTC collateral against 50 debt: HF 1.5.
const user = {
  totalCollateralMarketReferenceCurrency: '100',
  totalBorrowsMarketReferenceCurrency: '50',
  currentLiquidationThreshold: '0.75',
  userEmodeCategoryId: 0,
  isInEmode: false,
  isInIsolationMode: false,
} as unknown as ExtendedFormattedUser;

const swapTBTCToWBTC = (toAssetUserData?: Partial<ComputedUserReserve>) =>
  calculateHFAfterSwap({
    fromAmount: '10',
    fromAssetData: TBTC,
    fromAssetUserData: { usageAsCollateralEnabledOnUser: true } as ComputedUserReserve,
    fromAssetType: 'collateral',
    toAmountAfterSlippage: '10',
    toAssetData: WBTC,
    toAssetUserData: toAssetUserData as ComputedUserReserve | undefined,
    toAssetType: 'collateral',
    user,
    eModes: {},
  }).hfAfterSwap.toNumber();

describe('calculateHFAfterSwap', () => {
  it('counts the received asset when its first supply auto-enables collateral', () => {
    // (90 * 0.75 + 10 * 0.78) / 50
    expect(swapTBTCToWBTC({ scaledATokenBalance: '0' })).toBeCloseTo(1.51);
  });

  it('counts the received asset when it is already enabled as collateral', () => {
    expect(
      swapTBTCToWBTC({ scaledATokenBalance: '1', usageAsCollateralEnabledOnUser: true })
    ).toBeCloseTo(1.51);
  });

  it('ignores the received asset when the existing supply has collateral disabled', () => {
    // Supply only auto-enables collateral on the first supply, so the new aWBTC
    // stays disabled: 90 * 0.75 / 50
    expect(
      swapTBTCToWBTC({ scaledATokenBalance: '1', usageAsCollateralEnabledOnUser: false })
    ).toBeCloseTo(1.35);
  });
});

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

/**
 * Existing position: 100 collateral at a 0.8 weighted liquidation threshold against 64 debt,
 * so HF = 100 * 0.8 / 64 = 1.25 (the number in the reported screenshot).
 */
const makeUser = (
  usdcReserve?: { scaledATokenBalance: string; usageAsCollateralEnabledOnUser: boolean },
  overrides: Partial<ExtendedFormattedUser> = {}
) =>
  ({
    healthFactor: '1.25',
    totalCollateralMarketReferenceCurrency: '100',
    totalBorrowsMarketReferenceCurrency: '64',
    currentLiquidationThreshold: '0.8',
    userEmodeCategoryId: 0,
    isInEmode: false,
    isInIsolationMode: false,
    userReservesData: usdcReserve ? [{ underlyingAsset: USDC, ...usdcReserve }] : [],
    ...overrides,
  } as unknown as ExtendedFormattedUser);

const makeReserve = (overrides: Partial<ComputedReserveData> = {}) =>
  ({
    underlyingAsset: USDC,
    baseLTVasCollateral: '0',
    reserveLiquidationThreshold: '7800',
    formattedReserveLiquidationThreshold: '0.78',
    isIsolated: false,
    eModes: [],
    ...overrides,
  } as unknown as ComputedReserveData);

const eModes = {} as Record<number, EmodeCategory>;
const supply = valueToBigNumber('10');

// math-utils truncates the weighted liquidation threshold to bps, so compare to 3 decimals.
const hfAfter = (user: ExtendedFormattedUser, reserve: ComputedReserveData) =>
  valueToBigNumber(calculateHFAfterSupply(user, reserve, supply, eModes)).toNumber();

describe('calculateHFAfterSupply', () => {
  it('raises HF when adding to a 0 LTV asset already enabled as collateral', () => {
    const user = makeUser({ scaledATokenBalance: '1000', usageAsCollateralEnabledOnUser: true });

    // (100 * 0.8 + 10 * 0.78) / 64
    expect(hfAfter(user, makeReserve())).toBeCloseTo(1.371875, 3);
  });

  it('leaves HF unchanged on a first supply of a 0 LTV asset (not auto-enabled)', () => {
    expect(hfAfter(makeUser(), makeReserve())).toBeCloseTo(1.25, 3);
  });

  it('leaves HF unchanged when adding to an asset the user disabled as collateral', () => {
    const user = makeUser({ scaledATokenBalance: '1000', usageAsCollateralEnabledOnUser: false });
    const reserve = makeReserve({ baseLTVasCollateral: '7500' });

    expect(hfAfter(user, reserve)).toBeCloseTo(1.25, 3);
  });

  it('raises HF on a first supply of an asset with LTV > 0 (auto-enabled)', () => {
    const reserve = makeReserve({ baseLTVasCollateral: '7500' });

    expect(hfAfter(makeUser(), reserve)).toBeCloseTo(1.371875, 3);
  });

  it('treats a reserve entry with zero balance as a first supply', () => {
    // A stale collateral flag on an empty position doesn't matter: first supply re-decides it.
    const user = makeUser({ scaledATokenBalance: '0', usageAsCollateralEnabledOnUser: true });

    expect(hfAfter(user, makeReserve())).toBeCloseTo(1.25, 3);
  });

  it('uses the e-mode liquidation threshold for an ltvzero asset already enabled as collateral', () => {
    const user = makeUser(
      { scaledATokenBalance: '1000', usageAsCollateralEnabledOnUser: true },
      { userEmodeCategoryId: 1, isInEmode: true }
    );
    const reserve = makeReserve({
      baseLTVasCollateral: '7500',
      eModes: [
        {
          id: 1,
          collateralEnabled: true,
          ltvzeroEnabled: true,
          eMode: { formattedLiquidationThreshold: '0.95' },
        },
      ],
    } as unknown as Partial<ComputedReserveData>);

    // (100 * 0.8 + 10 * 0.95) / 64
    expect(hfAfter(user, reserve)).toBeCloseTo(1.398438, 3);
  });
});
