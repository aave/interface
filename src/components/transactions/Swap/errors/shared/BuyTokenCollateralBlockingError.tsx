import { Trans } from '@lingui/macro';
import { Alert, SxProps } from '@mui/material';

export const BuyTokenCollateralBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Alert severity="error" data-size="small" sx={{ mb: 6, width: '100%', mt: 4, ...sx }}>
      <Trans>
        The asset you are swapping into is not enabled as collateral on your position. Enable it as
        collateral first, otherwise this order cannot settle.
      </Trans>
    </Alert>
  );
};
