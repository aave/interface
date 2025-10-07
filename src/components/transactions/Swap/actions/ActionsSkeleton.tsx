import { Trans } from '@lingui/macro';
import { Button, CircularProgress } from '@mui/material';

import { SwapState } from '../types';

export type LoadingType = 'quote' | 'actions' | 'other';
const stateToLoadingType = (state: SwapState): LoadingType => {
  if (state.ratesLoading) return 'quote';
  if (state.actionsLoading) return 'actions';
  return 'other';
};

export const ActionsLoading: React.FC<{ state: SwapState }> = ({ state }) => {
  const loadingType = stateToLoadingType(state);

  return (
    <Button
      variant="contained"
      disabled={true}
      size="large"
      sx={{ minHeight: '44px', marginTop: '20px', width: '100%' }}
      data-cy="actionButton"
    >
      <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
      {loadingType === 'quote' ? (
        <Trans>Loading quote...</Trans>
      ) : loadingType === 'actions' ? (
        <Trans>Waiting for actions...</Trans>
      ) : (
        <Trans>Loading...</Trans>
      )}
    </Button>
  );
};
