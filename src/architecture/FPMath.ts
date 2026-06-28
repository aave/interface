import { FixedPointNumber, Numberish } from './FixedPointNumber';

export class FPMath {
  static MaxUint256: FixedPointNumber = new FixedPointNumber(
    BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
    BigInt(0)
  );

  static ZERO = new FixedPointNumber(BigInt(0), BigInt(0));

  static ONE = new FixedPointNumber(BigInt(1), BigInt(0));

  static MINUS_ONE = new FixedPointNumber(BigInt(-1), BigInt(0));

  private static maxScale(a: FixedPointNumber, b: FixedPointNumber): bigint {
    return a.scale > b.scale ? a.scale : b.scale;
  }

  static min(a: FixedPointNumber, b: FixedPointNumber): FixedPointNumber {
    const maxScale = FPMath.maxScale(a, b);
    const scaledA = a.scaleUp(maxScale);
    const scaledB = b.scaleUp(maxScale);
    return scaledA.value < scaledB.value ? a : b;
  }

  static max(a: FixedPointNumber, b: FixedPointNumber): FixedPointNumber {
    const maxScale = FPMath.maxScale(a, b);
    const scaledA = a.scaleUp(maxScale);
    const scaledB = b.scaleUp(maxScale);
    return scaledA.value > scaledB.value ? a : b;
  }

  static toFP(value: Numberish, _scale: Numberish): FixedPointNumber {
    const scale = Number(_scale);
    const stringValue = value.toString();
    const [integerPart, decimalPart] = stringValue.split('.');
    if (!decimalPart) {
      const zeroes = '0'.repeat(scale);
      return new FixedPointNumber(integerPart.concat(zeroes), scale);
    }
    const roundedDecimalPart =
      decimalPart.length > scale ? decimalPart.slice(0, scale) : decimalPart;
    const zeroes = '0'.repeat(scale - roundedDecimalPart.length);
    return new FixedPointNumber(integerPart.concat(roundedDecimalPart, zeroes), scale);
  }
}
