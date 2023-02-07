import { getAvailableBorrows, weightedAverageAPY } from '../ghoUtilities';

describe('gho utilities', () => {
  it('returns the correct amount available to borrow when user available borrow is less than facilitator level', () => {
    const userAvailableBorrows = 1000;
    const ghoFacilitatorCapacity = 10000;
    const ghoFacilitatorLevel = 8000;

    const available = getAvailableBorrows(
      userAvailableBorrows,
      ghoFacilitatorCapacity,
      ghoFacilitatorLevel
    );

    expect(available).toEqual(userAvailableBorrows);
  });

  it('returns the correct amount available to borrow when facilitator level is less than user available borrow', () => {
    const userAvailableBorrows = 20000;
    const ghoFacilitatorCapacity = 10000;
    const ghoFacilitatorLevel = 5000;

    const available = getAvailableBorrows(
      userAvailableBorrows,
      ghoFacilitatorCapacity,
      ghoFacilitatorLevel
    );

    expect(available).toEqual(ghoFacilitatorCapacity - ghoFacilitatorLevel);
  });

  it('calculates the weighted average APY correctly', () => {
    const baseBorrowRate = 0.02; // 2%
    const totalBorrowAmount = 1000;
    const discountableAmount = 100;
    const borrowRateAfterDiscount = 0.016; // 1.6%

    const apy = weightedAverageAPY(
      baseBorrowRate,
      totalBorrowAmount,
      discountableAmount,
      borrowRateAfterDiscount
    );

    expect(apy.toPrecision(3)).toEqual('0.0196');
  });

  it('calculates the weighted average APY correctly when total borrow amount is 0', () => {
    const baseBorrowRate = 0.02; // 2%
    const totalBorrowAmount = 0;
    const discountableAmount = 100;
    const borrowRateAfterDiscount = 0.016; // 1.6%

    const apy = weightedAverageAPY(
      baseBorrowRate,
      totalBorrowAmount,
      discountableAmount,
      borrowRateAfterDiscount
    );

    expect(apy.toPrecision(3)).toEqual('0.0200');
  });
  it('calculates the weighted average APY correctly when total borrow amount is less then the discountable amount', () => {
    const baseBorrowRate = 0.02; // 2%
    const totalBorrowAmount = 500;
    const discountableAmount = 1000;
    const borrowRateAfterDiscount = 0.016; // 1.6%

    const apy = weightedAverageAPY(
      baseBorrowRate,
      totalBorrowAmount,
      discountableAmount,
      borrowRateAfterDiscount
    );

    expect(apy.toPrecision(3)).toEqual('0.0160');
  });
});
