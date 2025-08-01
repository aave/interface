import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { GraphLegend } from './GraphLegend';
import { MeritApyDataItem, MeritApyGraph, MeritApyPlaceholderChart } from './MeritApyGraph';

// Stable chart component that avoids ParentSize recalculations
const StableChart = React.memo(
  ({
    data,
    lineColor,
    showAverage,
  }: {
    data: MeritApyDataItem[];
    lineColor: string;
    showAverage: boolean;
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(600); // Default width
    const CHART_HEIGHT = 155;

    useEffect(() => {
      // Calculate width once when component mounts
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width > 0 && width !== chartWidth) {
          setChartWidth(width);
        }
      }
    }, []); // Only run once on mount

    // Memoize the chart to prevent re-renders when data hasn't actually changed
    const chartContent = React.useMemo(() => {
      return data.length > 0 ? (
        <MeritApyGraph
          width={chartWidth}
          height={CHART_HEIGHT}
          data={data}
          lineColor={lineColor}
          showAverage={showAverage}
        />
      ) : (
        <MeritApyPlaceholderChart height={CHART_HEIGHT} width={chartWidth} />
      );
    }, [data, chartWidth, lineColor, showAverage]);

    return (
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: CHART_HEIGHT,
          position: 'relative',
        }}
      >
        {chartContent}
      </Box>
    );
  }
);

StableChart.displayName = 'StableChart';

export type MeritApyGraphContainerProps = {
  data?: MeritApyDataItem[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  lineColor?: string;
  showAverage?: boolean;
  title?: string;
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
}: MeritApyGraphContainerProps): JSX.Element => {
  const CHART_HEIGHT = 155;
  const CHART_HEIGHT_LOADING_FIX = 3;

  // Legend data
  const legendFields = [{ name: 'merit_apy', color: lineColor, text: title }];

  const graphLoading = (
    <Box
      sx={{
        height: CHART_HEIGHT + CHART_HEIGHT_LOADING_FIX,
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
        height: CHART_HEIGHT + CHART_HEIGHT_LOADING_FIX,
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

      <Box sx={{ flex: 1, minHeight: CHART_HEIGHT, width: '100%' }}>
        {loading && graphLoading}
        {error && graphError}
        {!loading && !error && (
          <StableChart data={data} lineColor={lineColor} showAverage={showAverage} />
        )}
      </Box>
    </Box>
  );
};
