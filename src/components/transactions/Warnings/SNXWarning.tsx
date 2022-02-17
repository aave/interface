import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

export const SNXWarning = () => {
  return (
    <Warning severity="warning">
      <Typography>
        <Trans>Before supplying</Trans> SNX{' '}
        <Trans>
          {' '}
          please check that the amount you want to supply is not currently being used for staking.
          If it is being used for staking, your transaction might fail.
        </Trans>
      </Typography>
    </Warning>
  );
};
