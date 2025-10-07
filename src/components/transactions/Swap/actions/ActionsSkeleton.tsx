import { Trans } from '@lingui/macro';
import { Button, CircularProgress } from '@mui/material';

import { SwapState } from '../types';

export const ActionsLoading: React.FC<{ state: SwapState }> = () => {
  return (
    <Button
      variant="contained"
      disabled={true}
      size="large"
      sx={{ minHeight: '44px', marginTop: '20px', width: '100%' }}
      data-cy="actionButton"
    >
      <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
      <Trans>Loading...</Trans>
    </Button>
  );
};
