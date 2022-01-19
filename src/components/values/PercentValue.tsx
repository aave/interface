import { useLingui } from '@lingui/react';
import { Typography } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { CompactValue } from './CompactValue';

interface PercentValueProps extends TypographyProps {
  value: string | number;
  maximumDecimals?: number;
  minimumDecimals?: number;
  updateCondition?: boolean;
  compact?: boolean;
}

export default function PercentValue({
  value,
  maximumDecimals = 2,
  minimumDecimals,
  updateCondition,
  compact,
  ...rest
}: PercentValueProps) {
  const { i18n } = useLingui();

  const [newValue, setNewValue] = useState(value);
  const updateValue = updateCondition ? undefined : value;
  useEffect(() => {
    setNewValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateValue]);

  const formattedNumber = Number(newValue) * 100;

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
      {!compact ? (
        i18n.number(formattedNumber, {
          maximumFractionDigits: maximumDecimals,
          minimumFractionDigits: minimumDecimals,
        })
      ) : (
        <CompactValue
          value={formattedNumber}
          maximumDecimals={maximumDecimals}
          minimumDecimals={minimumDecimals}
        />
      )}
      {' %'}
    </Typography>
  );
}
