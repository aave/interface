import invariant from 'tiny-invariant';

export type Numberish = number | string | bigint;
export type FixedPointNumberValue<T extends FixedPointNumber = FixedPointNumber> = Numberish | T;

export enum RoundMode {
  ROUND_DOWN,
  ROUND_UP,
  ROUND_HALF_UP,
  ROUND_HALF_DOWN,
}

interface IFixedPointNumber {
  add(value: FixedPointNumberValue): IFixedPointNumber;
  sub(value: FixedPointNumberValue): IFixedPointNumber;
  mul(value: FixedPointNumberValue): IFixedPointNumber;
  div(value: FixedPointNumberValue): IFixedPointNumber;
  pow(exp: FixedPointNumberValue): IFixedPointNumber;
  scaleUp(scale: number): IFixedPointNumber;
  scaleDown(scale: number, rounding: RoundMode): IFixedPointNumber;
  format(decimals?: number): string;
}

const countDecimals = (n: number) => {
  if (Math.floor(n) === n) return 0;
  return n.toString().split('.')[1].length || 0;
};

export class FixedPointNumber implements IFixedPointNumber {
  readonly value: bigint;
  readonly scale: bigint;

  constructor(value: FixedPointNumberValue, scale?: Numberish) {
    if (value instanceof FixedPointNumber) {
      this.value = value.value;
      this.scale = value.scale;
    } else {
      invariant(
        scale !== undefined,
        'scale must be provided if initializing from other than a FixedPointNumber'
      );
      this.value = BigInt(value);
      this.scale = BigInt(scale);
    }
  }

  add(value: FixedPointNumberValue): FixedPointNumber {
    if (!(value instanceof FixedPointNumber)) {
      const wrappedValue = BigInt(value);
      return new FixedPointNumber(wrappedValue + this.value, this.scale);
    }
    if (this.scale === value.scale) {
      return new FixedPointNumber(this.value + value.value, this.scale);
    }
    if (this.scale > value.scale) {
      return new FixedPointNumber(this.value + value.scaleUp(this.scale).value, this.scale);
    }
    return new FixedPointNumber(this.scaleUp(value.scale).value + value.value, value.scale);
  }

  sub(value: FixedPointNumberValue): FixedPointNumber {
    if (!(value instanceof FixedPointNumber)) {
      const wrappedValue = BigInt(value);
      return new FixedPointNumber(this.value - wrappedValue, this.scale);
    }
    if (this.scale === value.scale) {
      return new FixedPointNumber(this.value - value.value, this.scale);
    }
    if (this.scale > value.scale) {
      return new FixedPointNumber(this.value - value.scaleUp(this.scale).value, this.scale);
    }
    return new FixedPointNumber(this.scaleUp(value.scale).value - value.value, value.scale);
  }

  mul(value: FixedPointNumberValue): FixedPointNumber {
    if (!(value instanceof FixedPointNumber)) {
      const wrappedValue = BigInt(value);
      return new FixedPointNumber(this.value * wrappedValue, this.scale * BigInt(2));
    }
    return new FixedPointNumber(this.value * value.value, this.scale + value.scale);
  }

  scaleMul(value: Numberish): FixedPointNumber {
    const wrappedValue = BigInt(value);
    return new FixedPointNumber(this.value * wrappedValue, this.scale);
  }

  div(value: FixedPointNumberValue): FixedPointNumber {
    if (!(value instanceof FixedPointNumber)) {
      const wrappedValue = BigInt(value);
      return new FixedPointNumber(this.value / wrappedValue, 0);
    }
    const dividend = this.scale < value.scale ? this.scaleUp(value.scale) : this;
    const dividendWithMinPrecision =
      dividend.scale - value.scale < BigInt(3) ? this.scaleUp(dividend.scale + BigInt(3)) : this;
    return new FixedPointNumber(
      dividendWithMinPrecision.value / value.value,
      dividendWithMinPrecision.scale - value.scale
    );
  }

  scaleDiv(value: Numberish): FixedPointNumber {
    const wrappedValue = BigInt(value);
    return new FixedPointNumber(this.value / wrappedValue, this.scale);
  }

  pow(exp: Numberish): FixedPointNumber {
    const wrappedExp = BigInt(exp);
    return new FixedPointNumber(this.value ** BigInt(exp), this.scale ** wrappedExp);
  }

  scaleit(scale: Numberish): FixedPointNumber {
    const wrappedScale = BigInt(scale);
    if (wrappedScale === this.scale) {
      return this;
    }
    if (wrappedScale > this.scale) {
      return this.scaleUp(scale);
    }
    return this.scaleDown(scale, RoundMode.ROUND_DOWN);
  }

  scaleUp(scale: Numberish): FixedPointNumber {
    const wrappedScale = BigInt(scale);
    invariant(wrappedScale >= this.scale, 'scale must be higher or equal');
    return new FixedPointNumber(
      this.value * BigInt(10) ** BigInt(wrappedScale - this.scale),
      scale
    );
  }

  scaleDown(scale: Numberish, rounding: RoundMode): FixedPointNumber {
    const wrappedScale = BigInt(scale);
    if (wrappedScale === this.scale) return this;
    // we leave 1 extra decimal to handle rounding
    const preNewValue = this.value / BigInt(10) ** BigInt(this.scale - wrappedScale - BigInt(1));
    switch (rounding) {
      case RoundMode.ROUND_DOWN:
        return new FixedPointNumber(preNewValue / BigInt(10), wrappedScale);
      case RoundMode.ROUND_UP:
        return new FixedPointNumber(preNewValue / BigInt(10) + BigInt(1), wrappedScale);
      case RoundMode.ROUND_HALF_UP:
        return new FixedPointNumber((preNewValue + BigInt(5)) / BigInt(10), wrappedScale);
      case RoundMode.ROUND_HALF_DOWN:
        return new FixedPointNumber((preNewValue + BigInt(4)) / BigInt(10), wrappedScale);
    }
  }

  eq(value: FixedPointNumberValue): boolean {
    if (value instanceof FixedPointNumber) {
      if (this.scale > value.scale) {
        return this.value === value.value * BigInt(10) * (this.scale - value.scale);
      }
      return this.value * BigInt(10) ** (value.scale - this.scale) === value.value;
    }
    return this.value === BigInt(value);
  }

  lte(value: FixedPointNumberValue): boolean {
    if (value instanceof FixedPointNumber) {
      if (this.scale > value.scale) {
        return this.value <= value.value * BigInt(10) ** (this.scale - value.scale);
      }
      return this.value * BigInt(10) ** (value.scale - this.scale) <= value.value;
    }
    return this.value <= BigInt(value);
  }

  gte(value: FixedPointNumberValue): boolean {
    if (value instanceof FixedPointNumber) {
      if (this.scale > value.scale) {
        return this.value >= value.value * BigInt(10) ** (this.scale - value.scale);
      }
      return this.value * BigInt(10) ** (value.scale - this.scale) >= value.value;
    }
    return this.value >= BigInt(value);
  }

  lt(value: FixedPointNumberValue): boolean {
    if (value instanceof FixedPointNumber) {
      if (this.scale > value.scale) {
        return this.value < value.value * BigInt(10) ** (this.scale - value.scale);
      }
      return this.value * BigInt(10) ** (value.scale - this.scale) < value.value;
    }
    return this.value < BigInt(value);
  }

  gt(value: FixedPointNumberValue): boolean {
    if (value instanceof FixedPointNumber) {
      if (this.scale > value.scale) {
        return this.value > value.value * BigInt(10) ** (this.scale - value.scale);
      }
      return this.value * BigInt(10) ** (value.scale - this.scale) > value.value;
    }
    return this.value > BigInt(value);
  }

  percent(percent: number): FixedPointNumber {
    const decimals = countDecimals(percent);
    const integerPercent = BigInt(percent * 10 ** decimals);
    const scaledPercent = integerPercent * BigInt(10) ** this.scale;
    const scaledDivisor = BigInt(10) ** (this.scale + BigInt(decimals));
    return this.scaleMul(scaledPercent).scaleDiv(scaledDivisor);
  }

  format(decimals?: number): string {
    const stringValue = this.value.toString();
    const positivePart = this.value < BigInt(0) ? stringValue.substring(1) : stringValue;
    const paddedPositivePart = positivePart.padStart(Number(this.scale) + 1, '0');
    const positiveNumbers = paddedPositivePart.length - Number(this.scale);
    const positiveWithDecimals =
      paddedPositivePart.length === positiveNumbers
        ? paddedPositivePart.slice(0, positiveNumbers)
        : paddedPositivePart.slice(0, positiveNumbers) +
          '.' +
          paddedPositivePart.slice(
            positiveNumbers,
            decimals ? positiveNumbers + decimals : undefined
          );
    if (this.value < BigInt(0)) {
      return '-' + positiveWithDecimals;
    }
    return positiveWithDecimals;
  }

  toNumber(): number {
    return Number(this.format());
  }
}
