import { Trans } from '@lingui/macro';
import { Button, Link, Typography } from '@mui/material';

import { ROUTES } from '../primitives/Link';
import { Warning } from '../primitives/Warning';

export const AAVEWarning = () => {
  return (
    <Warning>
      <Typography color="black" variant="description">
        <Trans>Supplying your </Trans>AAVE
        <Trans> tokens is not the same as staking them. If you wish to stake your </Trans>AAVE
        <Trans> tokens, please go to the </Trans>
        <Button variant="text" component={Link} href={ROUTES.staking}>
          <Trans>staking view</Trans>
        </Button>
      </Typography>
    </Warning>
  );
};
