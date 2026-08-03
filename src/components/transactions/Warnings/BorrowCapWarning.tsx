import { Trans } from '@lingui/macro';
import { Alert, AlertProps } from '@mui/material';
import { AssetCapData } from 'src/hooks/useAssetCaps';

import { Link } from '../../primitives/Link';

type BorrowCapWarningProps = AlertProps & {
  borrowCap: AssetCapData;
  icon?: boolean;
};

export const BorrowCapWarning = ({ borrowCap, icon = true, ...rest }: BorrowCapWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!borrowCap.percentUsed || borrowCap.percentUsed < 98) return null;

  const severity = 'warning';

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
    <Alert severity={severity} icon={icon} sx={{ mb: 6, width: '100%' }} {...rest}>
      {renderText()}{' '}
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps" underline="always">
        <Trans>Learn more</Trans>
      </Link>
    </Alert>
  );
};
