import { Trans } from '@lingui/macro';
import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

type DebtCeilingWarningProps = {
  debtCeilingUsage: number;
  debtCeilingReached: boolean;
};

export const DebtCeilingWarning = ({
  debtCeilingUsage,
  debtCeilingReached,
}: DebtCeilingWarningProps) => {
  const severity = debtCeilingReached ? 'error' : 'warning';

  const renderText = () => {
    return debtCeilingReached ? (
      <Trans>
        Protocol debt ceiling is at 100% for this asset. Further borrowing against this asset is
        unavailable.
      </Trans>
    ) : (
      <Trans>
        Maximum amount available to borrow against this asset is limited because debt ceiling is at{' '}
        {debtCeilingUsage.toFixed(2)}%.
      </Trans>
    );
  };

  return (
    <Warning severity={severity}>
      {renderText()}
      <br />
      <Link href="#">
        <Trans>Learn more</Trans>
      </Link>
    </Warning>
  );
};
