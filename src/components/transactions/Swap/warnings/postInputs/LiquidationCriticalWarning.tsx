import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Dispatch } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { SwapParams, SwapState } from '../../types';

export function LiquidationCriticalWarning({
  state,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) {
  // TODO: move to be an error not a warning and remove isLiquidatable from state.
  return (
    <Warning
      severity="error"
      icon={false}
      sx={{
        display: state.isLiquidatable ? 'flex' : 'none',
        mt: 2,
        mb: 2,
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
