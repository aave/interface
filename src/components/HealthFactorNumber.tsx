import { valueToBigNumber } from '@aave/math-utils';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { Box, IconButton, SvgIcon, useTheme } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import BigNumber from 'bignumber.js';

import { FormattedNumber } from './primitives/FormattedNumber';

interface HealthFactorNumberProps extends TypographyProps {
  value: string;
  onInfoClick?: () => void;
}

export const HealthFactorNumber = ({ value, onInfoClick, ...rest }: HealthFactorNumberProps) => {
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
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <FormattedNumber
        value={formattedHealthFactor}
        sx={{ color: healthFactorColor, ...rest.sx }}
        maximumDecimals={2}
        {...rest}
      />

      {onInfoClick && (
        <IconButton
          sx={{ width: 15, height: 15, borderRadius: '50%', p: 0, minWidth: 0, ml: 1, ml: '5px' }}
          onClick={onInfoClick}
        >
          <SvgIcon sx={{ fontSize: 15, color: '#FFFFFF3B' }}>
            <InformationCircleIcon />
          </SvgIcon>
        </IconButton>
      )}
    </Box>
  );
};
