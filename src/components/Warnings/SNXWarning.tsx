import { Trans } from '@lingui/macro';
import { Warning } from '@mui/icons-material';
import { Typography } from '@mui/material';

export const SNXWarning = () => {
  return (
    <Warning>
      <Typography color="black" variant="description">
        <Trans>Before supplying </Trans>SNX
        <Trans>
          {' '}
          please check that the amount you want to supply is not currently being used for staking.
          If it is being used for staking, your transaction might fail.
        </Trans>
      </Typography>
    </Warning>
  );
};
