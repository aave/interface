import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwapParams, SwapState, SwapType } from '../../types';

export function LiquidationCriticalWarning({
  params,
  state,
}: {
  params: SwapParams;
  state: SwapState;
}) {
  if (!(params.swapType === SwapType.CollateralSwap && state.isLiquidatable)) return null;

  return (
    <Warning
      severity="error"
      icon={false}
      sx={{
        mt: 2,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="caption">
        <Trans>
          Your health factor after this swap will be critically low and may result in liquidation.
          Please choose a different asset or reduce the swap amount to stay safe.
        </Trans>
      </Typography>
    </Warning>
  );
}
