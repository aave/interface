import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';

import { GraphLegend } from './GraphLegend';
import { MeritApyDataItem, MeritApyGraph } from './MeritApyGraph';

const ResponsiveChart = React.memo(
  ({
    data,
    lineColor,
    showAverage,
    width,
    height,
  }: {
    data: MeritApyDataItem[];
    lineColor: string;
    showAverage: boolean;
    width: number;
    height: number;
  }) => {
    // Memoize the chart to prevent unnecessary re-renders
    const chartContent = React.useMemo(() => {
      // Early return if dimensions are too small
      if (width < 10) return null;

      return (
        <MeritApyGraph
          width={width}
          height={height}
          data={data}
          lineColor={lineColor}
          showAverage={showAverage}
        />
      );
    }, [data, width, height, lineColor, showAverage]);

    return (
      <Box
        sx={{
          width: '100%',
          height: height,
          position: 'relative',
        }}
      >
        {chartContent}
      </Box>
    );
  }
);

ResponsiveChart.displayName = 'ResponsiveChart';

export type MeritApyGraphContainerProps = {
  data?: MeritApyDataItem[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  lineColor?: string;
  showAverage?: boolean;
  title?: string;
  height?: number;
};

/**
 * Container component for Merit APY Graph
 * Handles loading states, error states, and responsive sizing
 */
export const MeritApyGraphContainer = ({
  data = [],
  loading = false,
  error = false,
  onRetry,
  lineColor = '#2EBAC6',
  showAverage = true,
  title = 'Merit APY',
  height = 155,
}: MeritApyGraphContainerProps): JSX.Element => {
  const CHART_HEIGHT_LOADING_FIX = 3;

  // Legend data
  const legendFields = [{ name: 'merit_apy', color: lineColor, text: title }];

  const graphLoading = (
    <Box
      sx={{
        height: height + CHART_HEIGHT_LOADING_FIX,
        width: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={20} sx={{ mb: 2, opacity: 0.5 }} />
      <Typography variant="subheader1" color="text.muted">
        <Trans>Loading data...</Trans>
      </Typography>
    </Box>
  );

  const graphError = (
    <Box
      sx={{
        height: height + CHART_HEIGHT_LOADING_FIX,
        width: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="subheader1">
        <Trans>Something went wrong</Trans>
      </Typography>
      <Typography variant="caption" sx={{ mb: 3 }}>
        <Trans>Data couldn&apos;t be fetched, please reload graph.</Trans>
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry}>
          <Trans>Reload</Trans>
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexShrink: 0,
        }}
      >
        <GraphLegend labels={legendFields} />
      </Box>

      <Box sx={{ flex: 1, minHeight: height, width: '100%' }}>
        {loading && graphLoading}
        {error && graphError}
        {!loading && !error && (
          <ParentSize>
            {({ width }) => (
              <ResponsiveChart
                data={data}
                lineColor={lineColor}
                showAverage={showAverage}
                width={width}
                height={height}
              />
            )}
          </ParentSize>
        )}
      </Box>
    </Box>
  );
};
