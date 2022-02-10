import { Trans } from '@lingui/macro';
import { Warning } from '@mui/icons-material';
import { Button, Link, Typography } from '@mui/material';
import { ROUTES } from '../primitives/Link';

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
