import { Trans } from '@lingui/macro';
import { Alert, Typography } from '@mui/material';

export const SNXWarning = () => {
  return (
    <Alert severity="warning" sx={{ mb: 6, width: '100%' }}>
      <Typography>
        <Trans>Before supplying</Trans> SNX{' '}
        <Trans>
          {' '}
          please check that the amount you want to supply is not currently being used for staking.
          If it is being used for staking, your transaction might fail.
        </Trans>
      </Typography>
    </Alert>
  );
};
