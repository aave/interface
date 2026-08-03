import { Trans } from '@lingui/macro';
import { Alert, Typography } from '@mui/material';
import { Dispatch } from 'react';

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
    <Alert
      severity="error"
      icon={false}
      sx={{
        width: '100%',
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
    </Alert>
  );
}
