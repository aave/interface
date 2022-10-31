import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';

export const AMPLWarning = () => {
  return (
    <Trans>
      <b>Ampleforth</b> is a rebasing asset. Visit the{' '}
      <Link href="https://docs.aave.com/developers/v/2.0/guides/ampl-asset-listing">
        <Trans>
          <u>documentation</u>
        </Trans>
      </Link>{' '}
      to learn more.
    </Trans>
  );
};
