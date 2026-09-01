import { Trans } from '@lingui/macro';
import { Alert, SxProps } from '@mui/material';

export const FlashLoanDisabledBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Alert severity="error" data-size="small" sx={{ mb: 6, width: '100%', mt: 4, ...sx }}>
      <Trans>Position swaps are disabled for this asset due to security reasons.</Trans>
    </Alert>
  );
};
