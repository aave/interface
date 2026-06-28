import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography } from '@mui/material';
import React, { Dispatch, useEffect, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { SwapError, SwapState } from '../../types';

const USER_DENIED_MESSAGES = [
  'user denied message signature',
  'user denied message',
  'user denied transaction signature',
  'user denied transaction',
  'user denied the request',
  'user denied request',
  'user rejected the request',
  'user rejected request',
  'user rejected the transaction',
  'user rejected transaction',
  'you cancelled the transaction',
];

export const hasUserDenied = (txError: SwapError) => {
  return USER_DENIED_MESSAGES.some((message) =>
    txError.rawError.message.toLowerCase().includes(message.toLowerCase())
  );
};

export const UserDenied = ({
  state,
  setState,
}: {
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  // Show info message for 10 seconds with progress circle at the end, then remove
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress increments every 50ms (100 * 50ms = 5s to reach 100)
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);

          if (state.actionsLoading) {
            setState({
              actionsLoading: false,
            });
          }

          // Hide after short delay to allow circle to show full (e.g. 250ms)
          setTimeout(() => {
            setVisible(false);
            setProgress(0);
            setState({
              error: undefined,
            });
          }, 100);

          return 100;
        }
        return prevProgress + 1;
      });
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Box sx={{ mt: 4, display: visible ? 'block' : 'none' }}>
      <Warning
        severity="info"
        sx={{
          margin: 0,
          '& .MuiAlert-action': { display: 'flex', alignItems: 'center', marginRight: 0, p: 0 },
        }}
        action={
          <CircularProgress
            variant="determinate"
            sx={{ opacity: 0.5, p: 0 }}
            value={progress}
            size={18}
          />
        }
      >
        <Typography variant="description">
          <Trans> User denied the operation.</Trans>
        </Typography>
      </Warning>
    </Box>
  );
};
