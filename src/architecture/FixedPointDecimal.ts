import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

export class FixedPointDecimal {
  private readonly _value: BigNumber;

  constructor(_value: BigNumberish, private readonly _decimals: number) {
    this._value = BigNumber.from(_value);
  }

  get value() {
    return this._value;
  }

  get decimals() {
    return this._decimals;
  }

  add(value: FixedPointDecimal) {
    return new FixedPointDecimal(this._value.add(value._value), this._decimals);
  }

  eq(value: FixedPointDecimal) {
    return this._value.eq(value._value);
  }

  format() {
    return formatUnits(this._value, this._decimals);
  }
}
