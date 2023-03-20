import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { TypographyProps } from '@mui/material/Typography';
import { TypographyPropsVariantOverrides } from '@mui/material/Typography/Typography';
import { OverridableStringUnion } from '@mui/types';

interface CompactNumberProps {
  value: string | number;
  visibleDecimals?: number;
  roundDown?: boolean;
}

const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];

function CompactNumber({ value, visibleDecimals = 2, roundDown }: CompactNumberProps) {
  const bnValue = valueToBigNumber(value);

  const integerPlaces = bnValue.toFixed(0).length;
  const significantDigitsGroup = Math.min(
    Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0),
    POSTFIXES.length - 1
  );
  const postfix = POSTFIXES[significantDigitsGroup];
  let formattedValue = normalizeBN(bnValue, 3 * significantDigitsGroup).toNumber();
  if (roundDown) {
    // Truncates decimals after the visible decimal point, i.e. 10.237 with 2 decimals becomes 10.23
    formattedValue =
      Math.trunc(Number(formattedValue) * 10 ** visibleDecimals) / 10 ** visibleDecimals;
  }
  const prefix = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: visibleDecimals,
    minimumFractionDigits: visibleDecimals,
  }).format(formattedValue);

  return (
    <>
      {prefix}
      {postfix}
    </>
  );
}

export interface FormattedNumberProps extends TypographyProps {
  value: string | number;
  symbol?: string;
  visibleDecimals?: number;
  compact?: boolean;
  percent?: boolean;
  symbolsColor?: string;
  symbolsVariant?: OverridableStringUnion<Variant | 'inherit', TypographyPropsVariantOverrides>;
  roundDown?: boolean;
  isMobile?: boolean;
}

export function FormattedNumber({
  value,
  symbol,
  visibleDecimals,
  compact,
  percent,
  symbolsVariant,
  symbolsColor,
  roundDown,
  isMobile,
  ...rest
}: FormattedNumberProps) {
  const number = percent ? Number(value) * 100 : Number(value);

  let decimals: number = visibleDecimals ?? 0;
  if (number === 0) {
    decimals = 0;
  } else if (visibleDecimals === undefined) {
    if (number > 1 || percent || symbol === 'USD') {
      decimals = 2;
    } else {
      decimals = 7;
    }
  }

  const minValue = 10 ** -(decimals as number);
  const isSmallerThanMin = number !== 0 && Math.abs(number) < Math.abs(minValue);
  let formattedNumber = isSmallerThanMin ? minValue : number;
  const forceCompact = compact !== false && (compact || number > 99_999);
  // rounding occurs inside of CompactNumber as the prefix, not base number is rounded
  if (roundDown && !forceCompact) {
    formattedNumber = Math.trunc(Number(formattedNumber) * 10 ** decimals) / 10 ** decimals;
  }

  return (
    <Typography
      {...rest}
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        ...rest.sx,
      }}
      noWrap
    >
      {isSmallerThanMin && (
        <Typography
          component="span"
          sx={{ mr: 0.5 }}
          variant={symbolsVariant || rest.variant}
          color={symbolsColor || 'text.secondary'}
        >
          {'<'}
        </Typography>
      )}
      {symbol?.toLowerCase() === 'usd' && !percent && (
        <Typography
          component="span"
          sx={{ mr: 0.5 }}
          variant={symbolsVariant || rest.variant}
          color={symbolsColor || 'text.secondary'}
        >
          $
        </Typography>
      )}
      {!forceCompact && !isMobile ? (
        new Intl.NumberFormat('en-US', {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        }).format(formattedNumber)
      ) : isMobile ? (
        <CompactNumber value={formattedNumber} visibleDecimals={2} roundDown={roundDown} />
      ) : (
        <CompactNumber value={formattedNumber} visibleDecimals={decimals} roundDown={roundDown} />
      )}

      {percent && (
        <Typography
          component="span"
          sx={{ ml: 0.5 }}
          variant={symbolsVariant || rest.variant}
          color={symbolsColor || 'text.secondary'}
        >
          %
        </Typography>
      )}
      {symbol?.toLowerCase() !== 'usd' && typeof symbol !== 'undefined' && (
        <Typography
          component="span"
          sx={{ ml: 0.5 }}
          variant={symbolsVariant || rest.variant}
          color={symbolsColor || 'text.secondary'}
        >
          {symbol}
        </Typography>
      )}
    </Typography>
  );
}
