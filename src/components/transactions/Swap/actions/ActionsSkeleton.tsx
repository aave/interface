import { Trans } from '@lingui/macro';
import { Button, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { SwapState } from '../types';

export type LoadingType = 'quote' | 'actions' | 'other';
const stateToLoadingType = (state: SwapState): LoadingType => {
  if (state.ratesLoading) return 'quote';
  if (state.actionsLoading) return 'actions';
  return 'other';
};

export const ActionsLoading: React.FC<{ state: SwapState }> = ({ state }) => {
  const loadingType = stateToLoadingType(state);

  // Timer logic for updating the loading text after 2 seconds when loadingType is 'quote'
  const [quoteTimeElapsed, setQuoteTimeElapsed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loadingType === 'quote') {
      setQuoteTimeElapsed(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setQuoteTimeElapsed(true);
      }, 2000);
    } else {
      // In case the loading type changes, clear timer and reset state
      setQuoteTimeElapsed(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loadingType]);

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
        quoteTimeElapsed ? (
          <Trans>Comparing best rates...</Trans>
        ) : (
          <Trans>Loading quote...</Trans>
        )
      ) : loadingType === 'actions' ? (
        <Trans>Waiting for actions...</Trans>
      ) : (
        <Trans>Loading...</Trans>
      )}
    </Button>
  );
};
