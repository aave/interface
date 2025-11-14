import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwapType } from '../../types/shared.types';

export const BalanceLowerThanInput = ({ sx, swapType }: { sx?: SxProps; swapType: SwapType }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          Your {swapType === SwapType.RepayWithCollateral ? 'collateral' : ''} balance is lower than
          the selected amount.
        </Trans>
      </Typography>
    </Warning>
  );
};
