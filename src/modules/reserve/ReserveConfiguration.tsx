import React from 'react';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import Paper from '@mui/material/Paper';

export const ReserveConfiguration = () => (
  <>
    <Paper sx={{ minHeight: '1000px', py: '16px', px: '24px' }}>
      <Typography variant="h3" sx={{ mb: '40px' }}>
        <Trans>Reserve status &#38; configuration</Trans>
      </Typography>
    </Paper>
  </>
);
