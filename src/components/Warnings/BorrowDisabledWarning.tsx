import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';

export const BorrowDisabledWarning = () => {
  return (
    <Trans>
      Borrowing is disabled due to an Aave community decision.{' '}
      <Link href="https://governance.aave.com/" underline="always">
        <Trans>More details</Trans>
      </Link>{' '}
    </Trans>
  );
};
