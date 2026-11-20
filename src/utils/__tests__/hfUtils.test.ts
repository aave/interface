import { ComputedUserReserve, valueToBigNumber } from '@aave/math-utils';
import { EmodeCategory } from 'src/helpers/types';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';

import {
  calculateHFAfterSupply,
  calculateHFAfterSwap,
  getReserveLiquidationThresholdInEmode,
  supplyCountsAsCollateral,
} from '../hfUtils';

jest.mock('src/hooks/app-data-provider/useAppDataProvider', () => ({}));

// tBTC (frozen, LTV 0, LT 0.75) and WBTC (LTV 0.73, LT 0.78), both priced at 1.
const reserve = (underlyingAsset: string, baseLTVasCollateral: string, lt: string) =>
  ({
    underlyingAsset,
    baseLTVasCollateral,
    reserveLiquidationThreshold: lt === '0' ? '0' : '7500',
    formattedReserveLiquidationThreshold: lt,
    formattedPriceInMarketReferenceCurrency: '1',
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

/**
 * Bought collateral, CoW collateral swap. Simple order = aToken -> aToken, received by transfer
 * (transfers never auto-enable collateral since v3.6). Flash-loan adapter = Pool.supply on the
 * user's behalf (first supply auto-enables when effective LTV > 0).
 *
 * Where the bought asset doesn't count, the flash-loan path can revert on-chain: the adapter
 * then pulls the sold aTokens and the Pool runs validateHFAndLtvzero. The HF below is what
 * that check sees, so HF < 1 is blocked by the existing IS_LIQUIDATABLE guard.
 */
describe('calculateHFAfterSwap: CoW simple order vs flash-loan adapter', () => {
  const ZERO_LTV = reserve('zero-ltv', '0', '0.78');

  const swapTo = (
    toAssetData: ComputedReserveData,
    toAssetReceivedVia: 'supply' | 'transfer',
    toAssetUserData?: Partial<ComputedUserReserve>
  ) =>
    calculateHFAfterSwap({
      fromAmount: '10',
      fromAssetData: TBTC,
      fromAssetUserData: { usageAsCollateralEnabledOnUser: true } as ComputedUserReserve,
      fromAssetType: 'collateral',
      toAmountAfterSlippage: '10',
      toAssetData,
      toAssetUserData: toAssetUserData as ComputedUserReserve | undefined,
      toAssetReceivedVia,
      toAssetType: 'collateral',
      user,
      eModes: {},
    }).hfAfterSwap.toNumber();

  const counted = 1.51; // (90 * 0.75 + 10 * 0.78) / 50
  const notCounted = 1.35; // 90 * 0.75 / 50

  const heldOn = { scaledATokenBalance: '1', usageAsCollateralEnabledOnUser: true };
  const heldOff = { scaledATokenBalance: '1', usageAsCollateralEnabledOnUser: false };
  const notHeld = { scaledATokenBalance: '0', usageAsCollateralEnabledOnUser: false };

  it.each`
    row                               | toAsset     | userData     | transfer      | supply
    ${'held, collateral on'}          | ${WBTC}     | ${heldOn}    | ${counted}    | ${counted}
    ${'held, collateral off'}         | ${WBTC}     | ${heldOff}   | ${notCounted} | ${notCounted}
    ${'not held, effective LTV > 0'}  | ${WBTC}     | ${notHeld}   | ${notCounted} | ${counted}
    ${'not held (no entry), LTV > 0'} | ${WBTC}     | ${undefined} | ${notCounted} | ${counted}
    ${'not held, effective LTV = 0'}  | ${ZERO_LTV} | ${notHeld}   | ${notCounted} | ${notCounted}
  `(
    '$row: simple order $transfer, flash-loan adapter $supply',
    ({ toAsset, userData, transfer, supply }) => {
      expect(swapTo(toAsset, 'transfer', userData)).toBeCloseTo(transfer);
      expect(swapTo(toAsset, 'supply', userData)).toBeCloseTo(supply);
    }
  );

  it('defaults to supply semantics', () => {
    expect(
      calculateHFAfterSwap({
        fromAmount: '10',
        fromAssetData: TBTC,
        fromAssetUserData: { usageAsCollateralEnabledOnUser: true } as ComputedUserReserve,
        fromAssetType: 'collateral',
        toAmountAfterSlippage: '10',
        toAssetData: WBTC,
        toAssetType: 'collateral',
        user,
        eModes: {},
      }).hfAfterSwap.toNumber()
    ).toBeCloseTo(counted);
  });

  it("uses the base threshold for an asset that is only borrowable in the user's e-mode", () => {
    // WBTC has an e-mode 1 entry that is borrow-only, so on-chain it keeps its 0.78 threshold.
    const wbtcBorrowOnlyInEmode = {
      ...WBTC,
      eModes: [
        { id: 1, collateralEnabled: false, eMode: { formattedLiquidationThreshold: '0.95' } },
      ],
    } as unknown as ComputedReserveData;
    const hf = calculateHFAfterSwap({
      fromAmount: '10',
      fromAssetData: TBTC,
      fromAssetUserData: { usageAsCollateralEnabledOnUser: true } as ComputedUserReserve,
      fromAssetType: 'collateral',
      toAmountAfterSlippage: '10',
      toAssetData: wbtcBorrowOnlyInEmode,
      toAssetUserData: heldOn as ComputedUserReserve,
      toAssetType: 'collateral',
      user: { ...user, userEmodeCategoryId: 1, isInEmode: true } as ExtendedFormattedUser,
      eModes: {},
    }).hfAfterSwap.toNumber();

    expect(hf).toBeCloseTo(counted);
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
    userReservesData: usdcReserve ? [{ underlyingAsset: USDC, ...usdcReserve }] : [],
    ...overrides,
  } as unknown as ExtendedFormattedUser);

const makeReserve = (overrides: Partial<ComputedReserveData> = {}) =>
  ({
    underlyingAsset: USDC,
    baseLTVasCollateral: '0',
    reserveLiquidationThreshold: '7800',
    formattedReserveLiquidationThreshold: '0.78',
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

/**
 * The e-mode switch path in SupplyModalContent (setUserEMode + supply in one multicall) uses
 * these helpers with the *target* e-mode, since setUserEMode runs before supply on-chain.
 */
describe('supplyCountsAsCollateral (target e-mode)', () => {
  // Category 1: asset is collateral with boosted LTV. Category 2: collateral but ltvzero.
  // Category 3: asset is only borrowable.
  const reserve = (baseLTVasCollateral: string) =>
    makeReserve({
      baseLTVasCollateral,
      eModes: [
        {
          id: 1,
          collateralEnabled: true,
          ltvzeroEnabled: false,
          eMode: { formattedLiquidationThreshold: '0.95' },
        },
        {
          id: 2,
          collateralEnabled: true,
          ltvzeroEnabled: true,
          eMode: { formattedLiquidationThreshold: '0.95' },
        },
        {
          id: 3,
          collateralEnabled: false,
          ltvzeroEnabled: false,
          eMode: { formattedLiquidationThreshold: '0.75' },
        },
      ],
    } as unknown as Partial<ComputedReserveData>);

  const counts = (user: ExtendedFormattedUser, poolReserve: ComputedReserveData, emodeId: number) =>
    supplyCountsAsCollateral({ user, poolReserve, emodeId, eModes });

  const inEmode1 = { userEmodeCategoryId: 1, isInEmode: true };

  it('first supply: counts when switching to a category with boosted LTV', () => {
    expect(counts(makeUser(), reserve('0'), 1)).toBe(true);
  });

  it('first supply: does not count when switching to an ltvzero category', () => {
    expect(counts(makeUser(), reserve('7500'), 2)).toBe(false);
  });

  it('first supply: does not count when switching to Default with base LTV 0', () => {
    expect(counts(makeUser(undefined, inEmode1), reserve('0'), 0)).toBe(false);
  });

  it('first supply: counts when switching to Default with base LTV > 0', () => {
    expect(counts(makeUser(undefined, inEmode1), reserve('7500'), 0)).toBe(true);
  });

  it('existing supply disabled as collateral: never counts, whatever the target', () => {
    const user = makeUser(
      { scaledATokenBalance: '1000', usageAsCollateralEnabledOnUser: false },
      inEmode1
    );

    expect(counts(user, reserve('7500'), 0)).toBe(false);
    expect(counts(user, reserve('7500'), 1)).toBe(false);
  });

  it('existing supply enabled as collateral: keeps counting after the switch', () => {
    const user = makeUser({ scaledATokenBalance: '1000', usageAsCollateralEnabledOnUser: true });

    expect(counts(user, reserve('7500'), 1)).toBe(true);
  });
});

describe('getReserveLiquidationThresholdInEmode', () => {
  const reserve = makeReserve({
    eModes: [
      { id: 1, collateralEnabled: true, eMode: { formattedLiquidationThreshold: '0.95' } },
      { id: 3, collateralEnabled: false, eMode: { formattedLiquidationThreshold: '0.75' } },
    ],
  } as unknown as Partial<ComputedReserveData>);

  it('uses the boosted threshold when the asset is collateral in the category', () => {
    expect(getReserveLiquidationThresholdInEmode(reserve, 1)).toBe('0.95');
  });

  it('uses the base threshold when the asset is only borrowable in the category', () => {
    expect(getReserveLiquidationThresholdInEmode(reserve, 3)).toBe('0.78');
  });

  it('uses the base threshold for Default', () => {
    expect(getReserveLiquidationThresholdInEmode(reserve, 0)).toBe('0.78');
  });
});

/**
 * Pools before v3.7 still enforce isolation mode on the first-supply auto-enable (ZKsync and
 * Metis, v3.6, still list isolated reserves). v3.7+ pools have no isolated reserves, so the
 * check is a no-op there.
 */
describe('isolation mode (pools before v3.7)', () => {
  const eligible = { baseLTVasCollateral: '7500' } as Partial<ComputedReserveData>;

  it('supply: does not count a first supply of an isolated asset', () => {
    expect(hfAfter(makeUser(), makeReserve({ ...eligible, isIsolated: true }))).toBeCloseTo(
      1.25,
      3
    );
  });

  it('supply: does not count a first supply while the user is in isolation mode', () => {
    const user = makeUser(undefined, { isInIsolationMode: true });
    expect(hfAfter(user, makeReserve(eligible))).toBeCloseTo(1.25, 3);
  });

  it('supply: keeps counting an isolated asset already enabled as collateral', () => {
    const user = makeUser(
      { scaledATokenBalance: '1000', usageAsCollateralEnabledOnUser: true },
      { isInIsolationMode: true }
    );
    expect(hfAfter(user, makeReserve({ ...eligible, isIsolated: true }))).toBeCloseTo(1.371875, 3);
  });

  it('supply: e-mode switch path applies the same rule', () => {
    const user = makeUser(undefined, { isInIsolationMode: true });
    expect(
      supplyCountsAsCollateral({ user, poolReserve: makeReserve(eligible), emodeId: 0, eModes })
    ).toBe(false);
  });

  const swapInto = (toAssetData: ComputedReserveData, userOverrides = {}) =>
    calculateHFAfterSwap({
      fromAmount: '10',
      fromAssetData: TBTC,
      fromAssetUserData: { usageAsCollateralEnabledOnUser: true } as ComputedUserReserve,
      fromAssetType: 'collateral',
      toAmountAfterSlippage: '10',
      toAssetData,
      toAssetUserData: { scaledATokenBalance: '0' } as ComputedUserReserve,
      toAssetReceivedVia: 'supply',
      toAssetType: 'collateral',
      user: { ...user, ...userOverrides } as ExtendedFormattedUser,
      eModes: {},
    }).hfAfterSwap.toNumber();

  it('flash-loan swap: does not count a newly bought isolated asset', () => {
    // 90 * 0.75 / 50
    expect(swapInto({ ...WBTC, isIsolated: true } as ComputedReserveData)).toBeCloseTo(1.35);
  });

  it('flash-loan swap: does not count a newly bought asset while in isolation mode', () => {
    expect(swapInto(WBTC, { isInIsolationMode: true })).toBeCloseTo(1.35);
  });
});
