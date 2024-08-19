import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography, useTheme } from '@mui/material';
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

  const theme = useTheme();
  const CHART_HEIGHT = 253;
  const CHART_HEIGHT_LOADING_FIX = 62;
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
    selectedTimeRange,
    reserve.symbol
  );

  // Supply fields
  const supplyFields: Fields = [
    { name: 'liquidityRate', color: theme.palette.point.positive, text: 'Supply APR' },
  ];

  // Borrow fields
  const borrowFields: Fields = [
    ...(reserve.stableBorrowRateEnabled
      ? ([
          {
            name: 'stableBorrowRate',
            color: theme.palette.point.riskHigh,
            text: 'Borrow APR, stable',
          },
        ] as const)
      : []),
    {
      name: 'variableBorrowRate',
      color: theme.palette.point.negative,
      text: 'Borrow APR, variable',
    },
  ];

  const fields = graphKey === 'supply' ? supplyFields : borrowFields;

  const graphLoading = (
    <Box
      sx={{
        height: 'auto',
        width: 'full',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        my: 'auto',
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
        height: CHART_HEIGHT,
        width: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body5">
        <Trans>Something went wrong</Trans>
      </Typography>
      <Typography variant="detail5" sx={{ mb: 3 }}>
        <Trans>Data couldn&apos;t be fetched, please reload graph.</Trans>
      </Typography>
      <Button variant="outlined" color="primary" size="small" onClick={refetch}>
        <Trans>Reload</Trans>
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        maxWidth: { xs: '100%', mdlg: 450 },
        width: '100%',
        minWidth: 350,
        height: CHART_HEIGHT + CHART_HEIGHT_LOADING_FIX,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ height: CHART_HEIGHT_LOADING_FIX }}>
        <GraphLegend labels={fields} />
        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
          <GraphTimeRangeSelector
            disabled={loading || error}
            timeRange={selectedTimeRange}
            onTimeRangeChanged={setSelectedTimeRange}
          />
        </Box>
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
              avgFieldName={graphKey === 'supply' ? 'liquidityRate' : 'variableBorrowRate'}
            />
          )}
        </ParentSize>
      )}
    </Box>
  );
};
