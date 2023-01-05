import { Trans } from '@lingui/macro';
import { AlertProps } from '@mui/material';
import { AssetCapData } from 'src/hooks/useAssetCaps';

import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

type DebtCeilingWarningProps = AlertProps & {
  debtCeiling: AssetCapData;
  icon?: boolean;
};

export const DebtCeilingWarning = ({
  debtCeiling,
  icon = true,
  ...rest
}: DebtCeilingWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!debtCeiling.percentUsed || debtCeiling.percentUsed < 98) return null;

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
    <Warning severity={severity} icon={icon} {...rest}>
      {renderText()}{' '}
      <Link
        href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
        underline="always"
      >
        <Trans>Learn more</Trans>
      </Link>
    </Warning>
  );
};
