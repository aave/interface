import { ComputedUserReserve } from '@aave/math-utils';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';

import { calculateHFAfterSwap } from '../hfUtils';

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
