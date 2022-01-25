import { valueToBigNumber } from '@aave/math-utils';
import { useTheme } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import BigNumber from 'bignumber.js';

import { FormattedNumber } from './primitives/FormattedNumber';

interface HealthFactorNumberProps extends TypographyProps {
  value: string;
}

export const HealthFactorNumber = ({ value, ...rest }: HealthFactorNumberProps) => {
  const { palette } = useTheme();

  const formattedHealthFactor = Number(valueToBigNumber(value).toFixed(2, BigNumber.ROUND_DOWN));
  let healthFactorColor = '';
  if (formattedHealthFactor >= 1.5) {
    healthFactorColor = palette.success.main;
  } else if (formattedHealthFactor < 1.1 && formattedHealthFactor > 0) {
    healthFactorColor = palette.error.main;
  } else {
    healthFactorColor = palette.warning.main;
  }

  return (
    <FormattedNumber
      value={formattedHealthFactor}
      sx={{ color: healthFactorColor, ...rest.sx }}
      maximumDecimals={2}
      {...rest}
    />
  );
};
