import { Alert, Typography } from '@mui/material';

import { OrderType, SwapState } from '../../types';

export function SlippageWarning({ state }: { state: SwapState }) {
  if (!state.showSlippageWarning) return null;
  if (state.orderType === OrderType.LIMIT) return null;

  return (
    <Alert severity="warning" icon={false} sx={{ mb: 6, width: '100%', mt: 5 }}>
      <Typography variant="caption">
        Slippage is lower than recommended. The swap may be delayed or fail.
      </Typography>
    </Alert>
  );
}
