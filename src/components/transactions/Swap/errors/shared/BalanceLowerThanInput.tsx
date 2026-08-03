import { Trans } from '@lingui/macro';
import { Alert, SxProps, Typography } from '@mui/material';

import { SwapType } from '../../types/shared.types';

export const BalanceLowerThanInput = ({ sx, swapType }: { sx?: SxProps; swapType: SwapType }) => {
  return (
    <Alert severity="error" sx={{ mb: 6, width: '100%', mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          Your {swapType === SwapType.RepayWithCollateral ? 'collateral' : ''} balance is lower than
          the selected amount.
        </Trans>
      </Typography>
    </Alert>
  );
};
