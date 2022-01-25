import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { useLingui } from '@lingui/react';
import { Typography } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';

interface CompactNumberProps {
  value: string | number;
  maximumDecimals?: number;
  minimumDecimals?: number;
}

const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];

function CompactNumber({ value, maximumDecimals = 2, minimumDecimals }: CompactNumberProps) {
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

interface FormattedNumberProps extends TypographyProps {
  value: string | number;
  symbol?: string;
  maximumDecimals?: number;
  minimumDecimals?: number;
  compact?: boolean;
  percent?: boolean;
}

export function FormattedNumber({
  value,
  symbol,
  maximumDecimals,
  minimumDecimals,
  compact,
  percent,
  ...rest
}: FormattedNumberProps) {
  const { i18n } = useLingui();

  const defaultMaximumDecimals = percent || symbol === 'USD' ? 2 : 7;
  const number = percent ? Number(value) * 100 : Number(value);

  const minValue = 10 ** -(maximumDecimals || defaultMaximumDecimals);
  const isSmallerThanMin = number !== 0 && number < minValue;

  const formattedMaximumDecimals =
    typeof maximumDecimals === 'undefined'
      ? value < 10000000000
        ? defaultMaximumDecimals
        : 2
      : maximumDecimals === 0
      ? 0
      : maximumDecimals;

  const formattedNumber = isSmallerThanMin ? minValue : number;

  return (
    <Typography
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        ...rest.sx,
      }}
      {...rest}
    >
      {isSmallerThanMin && '< '}
      {symbol?.toLowerCase() === 'usd' && !percent && '$ '}

      <>
        {!compact && value < 10000000000 ? (
          i18n.number(formattedNumber, {
            maximumFractionDigits: formattedMaximumDecimals,
            minimumFractionDigits: minimumDecimals,
          })
        ) : (
          <CompactNumber
            value={formattedNumber}
            maximumDecimals={formattedMaximumDecimals}
            minimumDecimals={minimumDecimals}
          />
        )}
      </>

      {percent && ' %'}
      {symbol?.toLowerCase() !== 'usd' && typeof symbol !== 'undefined' && ` ${symbol}`}
    </Typography>
  );
}
