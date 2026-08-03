import { Trans } from '@lingui/macro';
import { Alert, SxProps, Typography } from '@mui/material';

export const FlashLoanDisabledBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Alert severity="error" sx={{ mb: 6, width: '100%', mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>Position swaps are disabled for this asset due to security reasons.</Trans>
      </Typography>
    </Alert>
  );
};
