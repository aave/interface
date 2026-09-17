import { Trans } from '@lingui/macro';
import { Alert, Link } from '@mui/material';

import { ROUTES } from '../../primitives/Link';

export const AAVEWarning = () => {
  return (
    <Alert severity="info" sx={{ mb: 6, width: '100%' }}>
      <Trans>Supplying your </Trans> AAVE{' '}
      <Trans>tokens is not the same as staking them. If you wish to stake your </Trans> AAVE{' '}
      <Trans>tokens, please go to the </Trans>{' '}
      <Link href={ROUTES.staking}>
        <Trans>staking view</Trans>
      </Link>
    </Alert>
  );
};
