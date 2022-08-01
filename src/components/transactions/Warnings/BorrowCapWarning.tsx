import { Trans } from '@lingui/macro';
import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

export const BorrowCapWarning = () => {
  return (
    <Warning severity="warning">
      <Trans>
        Maximum amount available to borrow is limited because protocol borrow cap is nearly reached.
      </Trans>
      <br />
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps">
        <Trans>Learn more</Trans>
      </Link>
    </Warning>
  );
};
