import {
  APYSample,
  chainId,
  evmAddress,
  TimeWindow,
  useBorrowAPYHistory,
  useSupplyAPYHistory,
} from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { useState } from 'react';

import { ApyGraph, FormattedReserveHistoryItem, PlaceholderChart } from './ApyGraph';
import { GraphLegend } from './GraphLegend';
import { GraphTimeRangeSelector } from './GraphTimeRangeSelector';

type ApyGraphContainerProps = {
  label: string;
  color: string;
  loading: boolean;
  data: FormattedReserveHistoryItem[];
  error: boolean;
  selectedTimeRange: TimeWindow;
  onSelectedTimeRangeChanged: (timeRange: TimeWindow) => void;
};

// Transform API data to chart format
const transformApyData = (data: APYSample[] | undefined) =>
  data
    ?.map((item) => ({
      date: new Date(item.date).getTime(),
      value: Number(item.avgRate.value),
    }))
    .sort((a, b) => a.date - b.date) || [];

type ApyGraphProps = {
  chain: number;
  underlyingToken: string;
  market: string;
};

export const SupplyApyGraph = ({ chain, underlyingToken, market }: ApyGraphProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeWindow>(TimeWindow.LastWeek);

  const { data, loading, error } = useSupplyAPYHistory({
    chainId: chainId(chain),
    underlyingToken: evmAddress(underlyingToken),
    market: evmAddress(market),
    window: selectedTimeRange,
  });

  return (
    <ApyGraphContainer
      label="Supply APR"
      color="#2EBAC6"
      data={transformApyData(data)}
      loading={loading}
      error={error || false}
      selectedTimeRange={selectedTimeRange}
      onSelectedTimeRangeChanged={setSelectedTimeRange}
    />
  );
};

export const BorrowApyGraph = ({ chain, underlyingToken, market }: ApyGraphProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeWindow>(TimeWindow.LastWeek);

  const { data, loading, error } = useBorrowAPYHistory({
    chainId: chainId(chain),
    underlyingToken: evmAddress(underlyingToken),
    market: evmAddress(market),
    window: selectedTimeRange,
  });

  return (
    <ApyGraphContainer
      label="Borrow APR, variable"
      color="#B6509E"
      data={transformApyData(data)}
      loading={loading}
      error={error || false}
      selectedTimeRange={selectedTimeRange}
      onSelectedTimeRangeChanged={setSelectedTimeRange}
    />
  );
};

const ApyGraphContainer = ({
  label,
  color,
  data,
  loading,
  error,
  selectedTimeRange,
  onSelectedTimeRangeChanged,
}: ApyGraphContainerProps): JSX.Element => {
  const CHART_HEIGHT = 155;
  const CHART_HEIGHT_LOADING_FIX = 3;

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
        <Trans>Data couldn&apos;t be loaded.</Trans>
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ mt: 10, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <GraphLegend labels={[{ text: label, color }]} />
        <GraphTimeRangeSelector
          disabled={loading}
          timeRange={selectedTimeRange}
          onTimeRangeChanged={onSelectedTimeRangeChanged}
        />
      </Box>
      {loading && graphLoading}
      {error && graphError}
      {!loading && !error && (
        <ParentSize>
          {({ width }) =>
            data.length > 0 ? (
              <ApyGraph
                width={width}
                height={CHART_HEIGHT}
                data={data}
                field={{ name: 'value', color, text: label }}
                selectedTimeRange={selectedTimeRange}
              />
            ) : (
              /* Placeholder chart in the case where there is no rate data available yet */
              <PlaceholderChart height={CHART_HEIGHT} width={width} />
            )
          }
        </ParentSize>
      )}
    </Box>
  );
};
