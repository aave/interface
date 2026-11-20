import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import { BigNumber } from 'bignumber.js';
import { HeartIcon } from 'src/components/icons/HeartIcon';
import { healthFactorColor } from 'src/utils/hfUtils';

import { FormattedNumber } from './primitives/FormattedNumber';

interface HealthFactorNumberProps extends TypographyProps {
  value: string;
  onInfoClick?: () => void;
  withHeart?: boolean;
}

export const HealthFactorNumber = ({
  value,
  onInfoClick,
  withHeart,
  ...rest
}: HealthFactorNumberProps) => {
  const isInfinite = value === '-1';
  const formattedHealthFactor = Number(valueToBigNumber(value).toFixed(2, BigNumber.ROUND_DOWN));
  const color = healthFactorColor(isInfinite ? Infinity : formattedHealthFactor);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }} data-cy={'HealthFactorTopPannel'}>
      {withHeart && <HeartIcon sx={{ color, mr: '0.25rem' }} />}
      {isInfinite ? (
        <Typography variant="h5" color={color}>
          ∞
        </Typography>
      ) : (
        <FormattedNumber
          value={formattedHealthFactor}
          sx={{ color, ...rest.sx }}
          visibleDecimals={2}
          compact
          {...rest}
        />
      )}

      {onInfoClick && (
        <Button
          onClick={onInfoClick}
          variant="tertiary"
          size="small"
          sx={{ minWidth: 'unset', ml: 2 }}
        >
          <Trans>Risk details</Trans>
        </Button>
      )}
    </Box>
  );
};
