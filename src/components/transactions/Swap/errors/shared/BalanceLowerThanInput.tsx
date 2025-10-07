import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const BalanceLowerThanInput = ({ sx }: { sx?: SxProps }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>Your balance is lower than the selected amount.</Trans>
      </Typography>
    </Warning>
  );
};
