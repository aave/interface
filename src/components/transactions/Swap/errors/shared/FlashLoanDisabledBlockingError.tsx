import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const FlashLoanDisabledBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>Position swaps are disabled for this asset due to security reasons.</Trans>
      </Typography>
    </Warning>
  );
};
