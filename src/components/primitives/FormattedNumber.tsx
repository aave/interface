import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { useLingui } from '@lingui/react';
import { Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { TypographyProps } from '@mui/material/Typography';
import { TypographyPropsVariantOverrides } from '@mui/material/Typography/Typography';
import { OverridableStringUnion } from '@mui/types';

interface CompactNumberProps {
  value: string | number;
  visibleDecimals?: number;
}

const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];

function CompactNumber({ value, visibleDecimals = 2 }: CompactNumberProps) {
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
        maximumFractionDigits: visibleDecimals,
        minimumFractionDigits: visibleDecimals,
      })}
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
}

export function FormattedNumber({
  value,
  symbol,
  visibleDecimals,
  compact,
  percent,
  symbolsVariant,
  symbolsColor,
  ...rest
}: FormattedNumberProps) {
  const { i18n } = useLingui();

  const number = percent ? Number(value) * 100 : Number(value);

  let decimals = visibleDecimals;
  if (number === 0) {
    decimals = 0;
  } else if (visibleDecimals === undefined) {
    if (number > 1_000 || percent || symbol === 'USD') {
      decimals = 2;
    } else {
      decimals = 7;
    }
  }

  const minValue = 10 ** -(decimals as number);
  const isSmallerThanMin = number !== 0 && number < minValue;
  const formattedNumber = isSmallerThanMin ? minValue : number;

  const forceCompact = compact !== false && (compact || value < 100_000_000);

  return (
    <Typography
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        ...rest.sx,
      }}
      noWrap
      {...rest}
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

      <>
        {!forceCompact ? (
          i18n.number(formattedNumber, {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals,
          })
        ) : (
          <CompactNumber value={formattedNumber} visibleDecimals={decimals} />
        )}
      </>

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
