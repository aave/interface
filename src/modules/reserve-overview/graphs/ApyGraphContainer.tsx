import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { useState } from 'react';
import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ReserveRateTimeRange, useReserveRatesHistory } from 'src/hooks/useReservesHistory';
import { MarketDataType } from 'src/utils/marketsAndNetworksConfig';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
import { ApyGraph } from './ApyGraph';
import { GraphLegend } from './GraphLegend';
import { GraphTimeRangeSelector } from './GraphTimeRangeSelector';

type Field = 'liquidityRate' | 'stableBorrowRate' | 'variableBorrowRate';

type Fields = { name: Field; color: string; text: string }[];

type ApyGraphContainerKey = 'supply' | 'borrow';

type ApyGraphContainerProps = {
  graphKey: ApyGraphContainerKey;
  reserve: ComputedReserveData;
  currentMarketData: MarketDataType;
};

/**
 * NOTES:
 * This may not be named accurately.
 * This container uses the same graph but with different fields, so we use a 'graphKey' to determine which to show
 * This likely may need to be turned into two different container components if the graphs become wildly different.
 * This graph gets its data via an external API call, thus having loading/error states
 */
export const ApyGraphContainer = ({
  graphKey,
  reserve,
  currentMarketData,
}: ApyGraphContainerProps): JSX.Element => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<ReserveRateTimeRange>(
    ESupportedTimeRanges.OneMonth
  );

  const CHART_HEIGHT = 155;
  const CHART_HEIGHT_LOADING_FIX = 3.5;
  let reserveAddress = '';
  if (reserve) {
    if (currentMarketData.v3) {
      reserveAddress = `${reserve.underlyingAsset}${currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}${currentMarketData.chainId}`;
    } else {
      reserveAddress = `${reserve.underlyingAsset}${currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}`;
    }
  }
  const { data, loading, error, refetch } = useReserveRatesHistory(
    reserveAddress,
    selectedTimeRange
  );

  // Supply fields
  const supplyFields: Fields = [{ name: 'liquidityRate', color: '#2EBAC6', text: 'Supply APR' }];

  // Borrow fields
  const borrowFields: Fields = [
    ...(reserve.stableBorrowRateEnabled
      ? ([
          {
            name: 'stableBorrowRate',
            color: '#E7C6DF',
            text: 'Borrow APR, stable',
          },
        ] as const)
      : []),
    {
      name: 'variableBorrowRate',
      color: '#B6509E',
      text: 'Borrow APR, variable',
    },
  ];

  const fields = graphKey === 'supply' ? supplyFields : borrowFields;

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
      <Button variant="outlined" color="primary" onClick={refetch}>
        <Trans>Reload</Trans>
      </Button>
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
        <GraphLegend labels={fields} />
        <GraphTimeRangeSelector
          disabled={loading || error}
          timeRange={selectedTimeRange}
          onTimeRangeChanged={setSelectedTimeRange}
        />
      </Box>
      {loading && graphLoading}
      {error && graphError}
      {!loading && !error && data.length > 0 && (
        <ParentSize>
          {({ width }) => (
            <ApyGraph
              width={width}
              height={CHART_HEIGHT}
              data={data}
              fields={fields}
              selectedTimeRange={selectedTimeRange}
            />
          )}
        </ParentSize>
      )}
    </Box>
  );
};
