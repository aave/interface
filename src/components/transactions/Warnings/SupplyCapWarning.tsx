import { Trans } from '@lingui/macro';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

type SupplyCapWarningProps = {
  supplyCap: AssetCapData;
  icon?: boolean;
};

export const SupplyCapWarning = ({ supplyCap, icon = true }: SupplyCapWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!supplyCap.percentUsed || supplyCap.percentUsed < 98) return null;

  const severity = 'warning';

  const renderText = () => {
    return supplyCap.isMaxed ? (
      <Trans>Protocol supply cap is at 100% for this asset. Further supply unavailable.</Trans>
    ) : (
      <Trans>
        Maximum amount available to supply is limited because protocol supply cap is at{' '}
        {supplyCap.percentUsed.toFixed(2)}%.
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
