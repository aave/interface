import { Trans } from '@lingui/macro';
import { Warning } from '../primitives/Warning';
import { Typography } from '@mui/material';

export const CooldownWarning = () => {
  return (
    <Warning>
      <Typography color="black" variant="description">
        <b>
          <Trans>Cooldown period warning</Trans>
        </b>
        <br />
        <Trans>
          Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia
          consequat duis enim velit mollit. FAQ link
        </Trans>
      </Typography>
    </Warning>
  );
};
