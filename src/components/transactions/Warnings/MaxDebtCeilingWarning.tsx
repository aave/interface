import { Trans } from '@lingui/macro';
import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

export const MaxDebtCeilingWarning = () => {
  return (
    <Warning severity="error">
      <Trans>
        Protocol debt ceiling is at 100% for this asset. Further borrowing against this asset is
        unavailable.
      </Trans>
      <br />
      <Link href="#">
        <Trans>Learn more</Trans>
      </Link>
    </Warning>
  );
};
