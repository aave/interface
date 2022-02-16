import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

export const AMPLWarning = () => {
  return (
    <Warning severity="warning">
      <Typography>
        Ampleforth <Trans>is an asset affected by rebasing. Visit the </Trans>{' '}
        <Link href="https://docs.aave.com/developers/guides/ampl-asset-listing">
          <Trans>documentation</Trans>
        </Link>{' '}
        <Trans>or</Trans>{' '}
        <Link href="https://docs.aave.com/developers/guides/ampl-asset-listing">
          <Trans>Ampleforth FAQ</Trans>
        </Link>{' '}
        <Trans>to learn more.</Trans>
      </Typography>
    </Warning>
  );
};
