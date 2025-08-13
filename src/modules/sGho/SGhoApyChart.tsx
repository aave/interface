import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { useSGhoApyHistory } from 'src/hooks/useSGhoApyHistory';
import { MeritApyGraphContainer } from 'src/modules/reserve-overview/graphs/MeritApyGraphContainer';

/**
 * sGHO APY Chart component for displaying Merit APY history
 * Can be integrated into the sGHO deposit panel or other sGHO-related pages
 */
export const SGhoApyChart = () => {
  const { data, loading, error, refetch } = useSGhoApyHistory();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        <Trans>sGHO Merit APY History</Trans>
      </Typography>

      <MeritApyGraphContainer
        data={data}
        loading={loading}
        error={error}
        lineColor="#2EBAC6"
        showAverage={true}
        title="Merit APY"
        onRetry={refetch}
      />
    </Box>
  );
};
