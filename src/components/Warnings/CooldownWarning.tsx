import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import { Warning } from '../primitives/Warning';

export const CooldownWarning = () => {
  return (
    <Warning severity="warning" sx={{ '.MuiAlert-message': { p: 0 }, mb: 6 }}>
      <Typography variant="subheader1">
        <Trans>Cooldown period warning</Trans>
      </Typography>
      <Typography variant="caption">
        <Trans>
          Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia
          consequat duis enim velit mollit. FAQ link
        </Trans>
      </Typography>
    </Warning>
  );
};
