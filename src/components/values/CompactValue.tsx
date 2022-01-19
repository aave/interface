import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { useLingui } from '@lingui/react';

interface CompactValueProps {
  value: string | number;
  maximumDecimals?: number;
  minimumDecimals?: number;
}

const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];

export function CompactValue({ value, maximumDecimals = 2, minimumDecimals }: CompactValueProps) {
  const { i18n } = useLingui();

  const bnValue = valueToBigNumber(value);

  const integerPlaces = bnValue.toFixed(0).length;
  const significantDigitsGroup = Math.min(
    Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0),
    POSTFIXES.length - 1
  );
  const postfix = POSTFIXES[significantDigitsGroup];
  const formattedValue = normalizeBN(bnValue, 3 * significantDigitsGroup).toNumber();

  return (
    <>
      {i18n.number(formattedValue, {
        maximumFractionDigits: maximumDecimals,
        minimumFractionDigits: minimumDecimals,
      })}
      {postfix}
    </>
  );
}
