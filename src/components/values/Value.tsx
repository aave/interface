import { useLingui } from '@lingui/react';
import { Typography } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { CompactValue } from './CompactValue';

interface ValueProps extends TypographyProps {
  value: string | number;
  symbol?: string;
  maximumDecimals?: number;
  minimumDecimals?: number;
  updateCondition?: boolean;
  compact?: boolean;
}

export default function Value({
  value,
  symbol,
  maximumDecimals,
  minimumDecimals,
  updateCondition,
  compact,
  ...rest
}: ValueProps) {
  const { i18n } = useLingui();

  const [newValue, setNewValue] = useState(value);
  const updateValue = updateCondition ? undefined : value;
  useEffect(() => {
    setNewValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateValue]);

  const minValue = 10 ** -(maximumDecimals || 5);
  const isSmallerThanMin = Number(newValue) !== 0 && Number(newValue) < minValue;

  const formattedMaximumDecimals =
    typeof maximumDecimals === 'undefined'
      ? value < 10000000000
        ? 7
        : 2
      : maximumDecimals === 0
      ? 0
      : maximumDecimals;

  const number = isSmallerThanMin ? minValue : Number(newValue);

  return (
    <Typography
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        fontWeight: 700,
        ...rest.sx,
      }}
      {...rest}
    >
      {isSmallerThanMin && '< '}
      {symbol?.toLowerCase() === 'usd' && '$ '}

      <>
        {!compact && newValue < 10000000000 ? (
          i18n.number(number, {
            maximumFractionDigits: formattedMaximumDecimals,
            minimumFractionDigits: minimumDecimals,
          })
        ) : (
          <CompactValue
            value={number}
            maximumDecimals={formattedMaximumDecimals}
            minimumDecimals={minimumDecimals}
          />
        )}
      </>

      {symbol?.toLowerCase() !== 'usd' && ` ${symbol}`}
    </Typography>
  );
}
