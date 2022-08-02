import { Trans } from '@lingui/macro';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

type BorrowCapWarningProps = {
  borrowCap: AssetCapData;
  icon?: boolean;
};

export const BorrowCapWarning = ({ borrowCap, icon = true }: BorrowCapWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (borrowCap.percentUsed < 98) return null;

  const severity = borrowCap.isMaxed ? 'error' : 'warning';

  const renderText = () => {
    return borrowCap.isMaxed ? (
      <Trans>Protocol borrow cap is at 100% for this asset. Further borrowing unavailable.</Trans>
    ) : (
      <Trans>
        Maximum amount available to borrow is limited because protocol borrow cap is nearly reached.
      </Trans>
    );
  };

  return (
    <Warning severity={severity} icon={icon}>
      {renderText()}
      <br />
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps">
        <Trans>Learn more</Trans>
      </Link>
    </Warning>
  );
};
