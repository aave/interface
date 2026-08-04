import { Trans } from '@lingui/macro';
import { Alert } from '@mui/material';

import { SwapState } from '../../types';

export function USDTResetWarning({ state }: { state: SwapState }) {
  if (!state.requiresApprovalReset) return null;

  return (
    <Alert severity="info" sx={{ mb: 6, width: '100%', mt: 5 }}>
      <Trans>
        USDT on Ethereum requires approval reset before a new approval. This will require an
        additional transaction.
      </Trans>
    </Alert>
  );
}
