import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';

import { SwapState } from '../types';

type blockType = 'errors' | 'generic';
const stateToBlockType = (state: SwapState): blockType => {
  if (state.error) return 'errors';
  return 'generic';
};

export const ActionsBlocked: React.FC<{ state: SwapState }> = ({ state }) => {
  const blockType = stateToBlockType(state);

  return (
    <Button
      variant="contained"
      disabled={true}
      size="large"
      sx={{ minHeight: '44px', marginTop: '20px', width: '100%' }}
      data-cy="actionButton"
    >
      {blockType === 'errors' ? <Trans>Check errors</Trans> : <Trans>Swap</Trans>}
    </Button>
  );
};
