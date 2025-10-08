import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const USDTResetWarning = () => {
  return (
    <Warning severity="info" sx={{ mt: 5 }}>
      <Typography variant="caption">
        <Trans>
          USDT on Ethereum requires approval reset before a new approval. This will require an
          additional transaction.
        </Trans>
      </Typography>
    </Warning>
  );
};
