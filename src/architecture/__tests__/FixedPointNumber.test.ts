import { FixedPointNumber } from '../FixedPointNumber';

describe('FixedPointNumber.eq', () => {
  it('returns true for equal values with the same scale', () => {
    expect(new FixedPointNumber(500, 2).eq(new FixedPointNumber(500, 2))).toBe(true);
  });

  it('returns true for equal values when this.scale > value.scale', () => {
    expect(new FixedPointNumber(500, 2).eq(new FixedPointNumber(5, 0))).toBe(true);
  });

  it('returns true for equal values when this.scale < value.scale', () => {
    expect(new FixedPointNumber(5, 0).eq(new FixedPointNumber(500, 2))).toBe(true);
  });

  it('returns false for different values when this.scale > value.scale', () => {
    expect(new FixedPointNumber(501, 2).eq(new FixedPointNumber(5, 0))).toBe(false);
  });

  it('returns false for different values when this.scale < value.scale', () => {
    expect(new FixedPointNumber(5, 0).eq(new FixedPointNumber(501, 2))).toBe(false);
  });

  it('stays consistent with lt/gt for the same scale-mismatched pair', () => {
    const a = new FixedPointNumber(500, 2);
    const b = new FixedPointNumber(5, 0);
    expect(a.eq(b)).toBe(true);
    expect(a.lt(b)).toBe(false);
    expect(a.gt(b)).toBe(false);
  });

  it('handles a larger scale delta correctly', () => {
    expect(new FixedPointNumber(5000000, 6).eq(new FixedPointNumber(5, 0))).toBe(true);
  });
});
