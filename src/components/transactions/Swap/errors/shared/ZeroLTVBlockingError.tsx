import { Trans } from '@lingui/macro';
import { Alert, SxProps, Typography } from '@mui/material';

export const ZeroLTVBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Alert severity="error" sx={{ mb: 6, width: '100%', mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          You have assets with zero LTV that are blocking this operation. Please withdraw them or
          disable them as collateral first.
        </Trans>
      </Typography>
    </Alert>
  );
};
