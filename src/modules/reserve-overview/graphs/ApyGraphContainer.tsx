import {
  APYSample,
  chainId,
  evmAddress,
  TimeWindow,
  useBorrowAPYHistory,
  useSupplyAPYHistory,
} from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { useState } from 'react';
import { pickFigma } from 'src/utils/figmaColors';

import { ApyGraph, FormattedReserveHistoryItem, PlaceholderChart } from './ApyGraph';
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
  const { palette } = useTheme();

  const { data, loading, error } = useSupplyAPYHistory({
    chainId: chainId(chain),
    underlyingToken: evmAddress(underlyingToken),
    market: evmAddress(market),
    window: selectedTimeRange,
  });

  return (
    <ApyGraphContainer
      label="Supply APR"
      color={pickFigma(palette.mode)['purple-2']}
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
  const { palette } = useTheme();

  const { data, loading, error } = useBorrowAPYHistory({
    chainId: chainId(chain),
    underlyingToken: evmAddress(underlyingToken),
    market: evmAddress(market),
    window: selectedTimeRange,
  });

  return (
    <ApyGraphContainer
      label="Borrow APR, variable"
      color={pickFigma(palette.mode)['data-orange']}
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
  const statusSx = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const graphLoading = (
    <Box sx={statusSx}>
      <CircularProgress size={20} sx={{ mb: 2, opacity: 0.5 }} />
      <Typography variant="subheader1" color="fg-3">
        <Trans>Loading data...</Trans>
      </Typography>
    </Box>
  );

  const graphError = (
    <Box sx={statusSx}>
      <Typography variant="subheader1">
        <Trans>Something went wrong</Trans>
      </Typography>
      <Typography variant="caption" sx={{ mb: 3 }}>
        <Trans>Data couldn&apos;t be loaded.</Trans>
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ mt: '2.5rem', height: '15rem', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: '0.75rem', right: 0, zIndex: 1 }}>
        <GraphTimeRangeSelector
          disabled={loading}
          timeRange={selectedTimeRange}
          onTimeRangeChanged={onSelectedTimeRangeChanged}
        />
      </Box>
      <ParentSize>
        {({ width, height }) =>
          loading ? (
            graphLoading
          ) : error ? (
            graphError
          ) : data.length > 0 ? (
            <ApyGraph
              width={width}
              height={height}
              data={data}
              field={{ name: 'value', color, text: label }}
              selectedTimeRange={selectedTimeRange}
            />
          ) : (
            /* Placeholder chart in the case where there is no rate data available yet */
            <PlaceholderChart height={height} width={width} />
          )
        }
      </ParentSize>
    </Box>
  );
};
