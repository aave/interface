import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const ZeroLTVBlockingError = ({ sx }: { sx?: SxProps }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          You have assets with zero LTV that are blocking this operation. Please disable them as
          collateral first.
        </Trans>
      </Typography>
    </Warning>
  );
};
