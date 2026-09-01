import { Trans } from '@lingui/macro';
import { Alert, AlertProps } from '@mui/material';
import { AssetCapData } from 'src/hooks/useAssetCaps';

import { Link } from '../../primitives/Link';

type SupplyCapWarningProps = AlertProps & {
  supplyCap: AssetCapData;
  icon?: boolean;
};

// `icon` is destructured only to keep it out of `...rest` (the alert always shows its severity icon).
export const SupplyCapWarning = ({ supplyCap, icon, ...rest }: SupplyCapWarningProps) => {
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
    <Alert severity={severity} data-size="small" sx={{ mb: 6, width: '100%' }} {...rest}>
      {renderText()}{' '}
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps" underline="always">
        <Trans>Learn more</Trans>
      </Link>
    </Alert>
  );
};
