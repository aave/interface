import { ArrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';

import { Link } from '../primitives/Link';

export const GHODiscountButton = () => {
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  return (
    <Button
      endIcon={
        <SvgIcon sx={{ width: 14, height: 14 }}>
          <ArrowRightIcon />
        </SvgIcon>
      }
      component={Link}
      size="small"
      variant="outlined"
      href="https://docs.aave.com" // TO-DO: Link to GHO docs
      sx={{ width: downToXSM ? '100%' : '275px', mt: downToXSM ? 4 : 0, ml: downToXSM ? 0 : 4 }}
    >
      <Typography variant="buttonS">
        <Trans>Discount is available. Learn more</Trans>
      </Typography>
    </Button>
  );
};
