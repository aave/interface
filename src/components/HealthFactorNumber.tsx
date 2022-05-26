import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography, Box, Button, useTheme } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import BigNumber from 'bignumber.js';

import { FormattedNumber } from './primitives/FormattedNumber';

interface HealthFactorNumberProps extends TypographyProps {
  value: string;
  onInfoClick?: () => void;
  HALIntegrationComponent?: React.ReactNode;
}

export const HealthFactorNumber = ({
  value,
  onInfoClick,
  HALIntegrationComponent,
  ...rest
}: HealthFactorNumberProps) => {
  const { palette } = useTheme();

  const formattedHealthFactor = Number(valueToBigNumber(value).toFixed(2, BigNumber.ROUND_DOWN));
  let healthFactorColor = '';
  if (formattedHealthFactor >= 3) {
    healthFactorColor = palette.success.main;
  } else if (formattedHealthFactor < 1.1) {
    healthFactorColor = palette.error.main;
  } else {
    healthFactorColor = palette.warning.main;
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: { xs: 'flex-start', xsm: 'center' },
        flexDirection: { xs: 'column', xsm: 'row' },
      }}
      data-cy={'HealthFactorTopPannel'}
    >
      {value === '-1' ? (
        <Typography variant="secondary14" color={palette.success.main}>
          ∞
        </Typography>
      ) : (
        <FormattedNumber
          value={formattedHealthFactor}
          sx={{ color: healthFactorColor, ...rest.sx }}
          visibleDecimals={2}
          compact
          {...rest}
        />
      )}

      {onInfoClick && (
        <Button
          onClick={onInfoClick}
          variant="surface"
          size="small"
          sx={{ minWidth: 'unset', ml: { xs: 0, xsm: 2 } }}
        >
          <Trans>Risk details</Trans>
        </Button>
      )}

      {HALIntegrationComponent && (
        <Box ml={{ xs: 0, xsm: 2 }} mt={{ xs: 1, xsm: 0 }}>
          {HALIntegrationComponent}
        </Box>
      )}
    </Box>
  );
};
