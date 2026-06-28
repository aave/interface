import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const InsufficientBorrowPowerBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          Insufficient collateral to cover new borrow position. Wallet must have borrowing power
          remaining to perform debt switch.
        </Trans>
      </Typography>
    </Warning>
  );
};
