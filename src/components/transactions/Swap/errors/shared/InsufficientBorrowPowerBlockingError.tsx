import { Trans } from '@lingui/macro';
import { Alert, SxProps } from '@mui/material';

export const InsufficientBorrowPowerBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Alert severity="error" data-size="small" sx={{ mb: 6, width: '100%', mt: 4, ...sx }}>
      <Trans>
        Insufficient collateral to cover new borrow position. Wallet must have borrowing power
        remaining to perform debt switch.
      </Trans>
    </Alert>
  );
};
