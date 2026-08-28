import { MAX_UINT_AMOUNT } from '@aave/contract-helpers';
import { parseUnits } from 'ethers/lib/utils';

import { getNewApprovalAmount, needsUSDTApprovalReset } from '../usdtHelpers';

const USDT_DECIMALS = 6;
const ETHEREUM = 1;

/** Would the USDT reset run for this pair of allowances? */
const resets = (currentApproval: string, newApproval: string) =>
  needsUSDTApprovalReset('USDT', ETHEREUM, currentApproval, newApproval);

describe('getNewApprovalAmount', () => {
  it('brings a finite requested allowance into token units', () => {
    expect(
      getNewApprovalAmount(parseUnits('32.7', USDT_DECIMALS).toString(), USDT_DECIMALS, '32.68')
    ).toBe('32.7');
  });

  it('passes a typed amount through when no finite allowance was requested', () => {
    expect(getNewApprovalAmount(undefined, USDT_DECIMALS, '32.68')).toBe('32.68');
  });

  it('reads the full-repay sentinel as an unlimited approval, not as nothing to approve', () => {
    // '-1' means "repay everything", and with no finite allowance requested the approval
    // that follows is for MAX_UINT. Returning '-1' here made callers skip the check.
    const amount = getNewApprovalAmount(undefined, USDT_DECIMALS, '-1');

    expect(amount).toBe(MAX_UINT_AMOUNT);
    expect(Number(amount)).toBeGreaterThan(0);
  });

  it('prefers the finite allowance over the sentinel on a full repay', () => {
    expect(
      getNewApprovalAmount(parseUnits('32.76', USDT_DECIMALS).toString(), USDT_DECIMALS, '-1')
    ).toBe('32.76');
  });
});

describe('USDT reset on a full repay', () => {
  // An exact-amount repay leaves a residual allowance behind: it approves a little over the
  // debt and only pulls the debt. USDT on Ethereum reverts approve() over a non-zero
  // allowance, so the next approval has to be preceded by a reset to 0.
  const residual = '0.163812';

  it('resets before an unlimited approval over a residual allowance', () => {
    expect(resets(residual, getNewApprovalAmount(undefined, USDT_DECIMALS, '-1'))).toBe(true);
  });

  it('resets before a finite approval over a residual allowance', () => {
    const exact = getNewApprovalAmount(
      parseUnits('32.76', USDT_DECIMALS).toString(),
      USDT_DECIMALS,
      '-1'
    );

    expect(resets(residual, exact)).toBe(true);
  });

  it('does not reset when there is no allowance to clear', () => {
    expect(resets('0', getNewApprovalAmount(undefined, USDT_DECIMALS, '-1'))).toBe(false);
  });

  it('does not reset when the existing allowance already covers the approval', () => {
    expect(resets('100', getNewApprovalAmount(undefined, USDT_DECIMALS, '32.68'))).toBe(false);
  });
});
