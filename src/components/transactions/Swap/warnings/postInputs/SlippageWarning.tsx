import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwapState } from '../../types';

export function SlippageWarning({ state }: { state: SwapState }) {
  if (!state.showSlippageWarning) return null;

  return (
    <Warning severity="warning" icon={false} sx={{ mt: 5 }}>
      <Typography variant="caption">
        Slippage is lower than recommended. The swap may be delayed or fail.
      </Typography>
    </Warning>
  );
}
