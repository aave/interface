import { Trans } from '@lingui/macro';
import { Alert, Typography } from '@mui/material';

import { SwapState } from '../../types';

export function GasEstimationWarning({ state }: { state: SwapState }) {
  // Check if there's a gas estimation warning in the warnings array
  const hasGasEstimationWarning = state.warnings.some(
    (warning) =>
      warning.message.includes('Gas estimation') || warning.message.includes('gas estimation')
  );

  if (!hasGasEstimationWarning) return null;

  return (
    <Alert severity="warning" icon={false} sx={{ mb: 6, width: '100%', mt: 5 }}>
      <Typography variant="caption">
        <Trans>
          The swap could not be completed. Try increasing slippage or changing the amount.
        </Trans>
      </Typography>
    </Alert>
  );
}
