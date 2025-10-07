import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';

import { SwapState } from '../types';

export const ActionsBlocked: React.FC<{ state: SwapState }> = () => {
  return (
    <Button
      variant="contained"
      disabled={true}
      size="large"
      sx={{ minHeight: '44px', marginTop: '20px', width: '100%' }}
      data-cy="actionButton"
    >
      <Trans>Check errors</Trans>
    </Button>
  );
};
