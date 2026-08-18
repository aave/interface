import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const BuyTokenCollateralBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          The asset you are swapping into is not enabled as collateral on your position. Enable it
          as collateral first, otherwise this order cannot settle.
        </Trans>
      </Typography>
    </Warning>
  );
};
