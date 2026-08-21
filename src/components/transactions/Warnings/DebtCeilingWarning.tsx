import { Trans } from '@lingui/macro';
import { Alert, AlertProps } from '@mui/material';
import { AssetCapData } from 'src/hooks/useAssetCaps';

import { Link } from '../../primitives/Link';

type DebtCeilingWarningProps = AlertProps & {
  debtCeiling: AssetCapData;
  icon?: boolean;
};

// `icon` is destructured only to keep it out of `...rest` (the alert always shows its severity icon).
export const DebtCeilingWarning = ({ debtCeiling, icon, ...rest }: DebtCeilingWarningProps) => {
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
    <Alert severity={severity} sx={{ mb: 6, width: '100%' }} {...rest}>
      {renderText()}{' '}
      <Link
        href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
        underline="always"
      >
        <Trans>Learn more</Trans>
      </Link>
    </Alert>
  );
};
