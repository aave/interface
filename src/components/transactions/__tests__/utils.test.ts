import { BigNumber } from 'bignumber.js';
import { parseUnits } from 'ethers/lib/utils';
import { CollateralType } from 'src/helpers/types';
import { ComputedUserReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

import {
  checkRequiresApproval,
  getAssetCollateralType,
  getRepayAmountToApprove,
  getSafeAmountToRepayAll,
} from '../utils';

/**
 * Numbers taken from the cbBTC support report on Aave V3 Ethereum
 * (wallet 0xCA686974913389D42F3C5F61010503DAccDb487a, block 25703709).
 * The user approved 32.7 by hand, which the UI never accepted.
 */
const DEBT = '32.68074616';
const HAND_SET_APPROVAL = '32.7';
const DECIMALS = 8;

const gateRequires = (debt: string) => getSafeAmountToRepayAll(debt, DECIMALS).toString(10);

/** Does an allowance of `approved` let the user past the approval gate for this debt? */
const passesGate = (approved: string, debt: string) =>
  !checkRequiresApproval({
    approvedAmount: approved,
    amount: gateRequires(debt),
    signedAmount: '0',
  });

const approvalForMaxRepay = (debt: string) =>
  getRepayAmountToApprove({
    amountRequiringApproval: gateRequires(debt),
    isMaxRepay: true,
    decimals: DECIMALS,
  });

describe('getSafeAmountToRepayAll', () => {
  it('applies the full-repay buffer on top of the debt', () => {
    expect(gateRequires(DEBT)).toBe('32.76244803');
  });
});

describe('getRepayAmountToApprove', () => {
  it('leaves a partial repay amount untouched', () => {
    expect(
      getRepayAmountToApprove({
        amountRequiringApproval: '10.5',
        isMaxRepay: false,
        decimals: DECIMALS,
      })
    ).toBe('10.5');
  });

  it('trims a typed amount to the token decimals so parseUnits cannot throw', () => {
    // The repay input has no decimalScale, so 7dp on a 6dp token is reachable by typing.
    const approved = getRepayAmountToApprove({
      amountRequiringApproval: '1.1234567',
      isMaxRepay: false,
      decimals: 6,
    });

    expect(approved).toBe('1.123457');
    expect(() => parseUnits(approved, 6)).not.toThrow();
  });

  it('rounds a typed amount up, so the trimmed approval still clears the gate', () => {
    const typed = '1.1234567';
    const approved = getRepayAmountToApprove({
      amountRequiringApproval: typed,
      isMaxRepay: false,
      decimals: 6,
    });

    expect(new BigNumber(approved).isGreaterThanOrEqualTo(typed)).toBe(true);
    expect(
      checkRequiresApproval({ approvedAmount: approved, amount: typed, signedAmount: '0' })
    ).toBe(false);
  });

  it('reproduces the reported bug: a hand-set approval above the debt still fails the gate', () => {
    expect(new BigNumber(HAND_SET_APPROVAL).isGreaterThan(DEBT)).toBe(true);
    expect(passesGate(HAND_SET_APPROVAL, DEBT)).toBe(false);
  });

  it('approves an amount that satisfies the gate for a full repay', () => {
    expect(passesGate(approvalForMaxRepay(DEBT), DEBT)).toBe(true);
  });

  it('still satisfies the gate after the debt accrues while the approval is in flight', () => {
    const approved = approvalForMaxRepay(DEBT);
    // Debt keeps growing, so the gate's target creeps up after we build the approval.
    const accruedDebt = new BigNumber(DEBT).multipliedBy('1.002').toString(10);

    // Approving exactly what the gate asked for at t0 would now fall short -
    // this is what the margin exists to absorb.
    expect(passesGate(gateRequires(DEBT), accruedDebt)).toBe(false);
    expect(passesGate(approved, accruedDebt)).toBe(true);
  });

  it('never returns more decimals than the token supports', () => {
    const approved = approvalForMaxRepay(DEBT);
    expect(new BigNumber(approved).decimalPlaces()).toBeLessThanOrEqual(DECIMALS);
  });

  it('does not return exponential notation for dust-sized debts', () => {
    expect(approvalForMaxRepay('0.00000001')).not.toMatch(/e/i);
  });
});

describe('getAssetCollateralType', () => {
  // Arbitrum V3 USDC: base LTV 0 (so UiPoolDataProvider reports usageAsCollateralEnabled=false),
  // liquidation threshold 78%.
  const makeUserReserve = (
    scaledATokenBalance: string,
    usageAsCollateralEnabledOnUser: boolean,
    reserve: Record<string, unknown> = {}
  ) =>
    ({
      scaledATokenBalance,
      usageAsCollateralEnabledOnUser,
      reserve: {
        usageAsCollateralEnabled: false,
        reserveLiquidationThreshold: '7800',
        ...reserve,
      },
    } as unknown as ComputedUserReserveData);

  const collateralType = (userReserve: ComputedUserReserveData) =>
    getAssetCollateralType(userReserve, '100', false, false);

  it('reports ENABLED for a 0 LTV asset the user already has enabled as collateral', () => {
    expect(collateralType(makeUserReserve('1000', true))).toBe(CollateralType.ENABLED);
  });

  it('reports UNAVAILABLE for a first supply of a 0 LTV asset', () => {
    expect(collateralType(makeUserReserve('0', false))).toBe(CollateralType.UNAVAILABLE);
  });

  it('reports UNAVAILABLE for a 0 LTV asset the user has disabled as collateral', () => {
    expect(collateralType(makeUserReserve('1000', false))).toBe(CollateralType.UNAVAILABLE);
  });

  it('reports UNAVAILABLE when the liquidation threshold is 0', () => {
    const userReserve = makeUserReserve('1000', true, { reserveLiquidationThreshold: '0' });

    expect(collateralType(userReserve)).toBe(CollateralType.UNAVAILABLE);
  });
});
