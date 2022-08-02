import { Trans } from '@lingui/macro';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

type DebtCeilingWarningProps = {
  debtCeiling: AssetCapData;
};

export const DebtCeilingWarning = ({ debtCeiling }: DebtCeilingWarningProps) => {
  const severity = debtCeiling.isMaxed ? 'error' : 'warning';

  const renderText = () => {
    return debtCeiling.isMaxed ? (
      <Trans>
        Protocol debt ceiling is at 100% for this asset. Further borrowing against this asset is
        unavailable.
      </Trans>
    ) : (
      <Trans>
        Maximum amount available to borrow against this asset is limited because debt ceiling is at{' '}
        {debtCeiling.percentUsed.toFixed(2)}%.
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
