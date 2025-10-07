import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const GenericError = ({ sx, message }: { sx?: SxProps; message: string }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>{message}</Trans>
      </Typography>
    </Warning>
  );
};
