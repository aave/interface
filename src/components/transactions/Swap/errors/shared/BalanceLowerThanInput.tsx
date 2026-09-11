import { Trans } from '@lingui/macro';
import { Alert, SxProps } from '@mui/material';

import { SwapType } from '../../types/shared.types';

export const BalanceLowerThanInput = ({ sx, swapType }: { sx?: SxProps; swapType: SwapType }) => {
  return (
    <Alert severity="error" data-size="small" sx={{ mb: 6, width: '100%', mt: 4, ...sx }}>
      <Trans>
        Your {swapType === SwapType.RepayWithCollateral ? 'collateral' : ''} balance is lower than
        the selected amount.
      </Trans>
    </Alert>
  );
};
