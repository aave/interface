import { Trans } from '@lingui/macro';
import { Alert } from '@mui/material';

import { Link } from '../../../components/primitives/Link';

export const AMPLWarning = () => {
  return (
    <Alert severity="warning" sx={{ px: 5 }}>
      <b>Ampleforth</b> is an asset affected by rebasing. Visit the{' '}
      <Link href="https://docs.aave.com/developers/guides/ampl-asset-listing">
        <Trans>documentation</Trans>
      </Link>{' '}
      or{' '}
      <Link href="https://faq.ampleforth.org/lending_and_borrowing">
        <Trans>{"Ampleforth's FAQ"}</Trans>
      </Link>{' '}
      to learn more.
    </Alert>
  );
};
