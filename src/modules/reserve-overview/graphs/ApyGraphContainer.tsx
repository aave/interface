import { useState } from 'react';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ReserveRateTimeRange, useReserveRatesHistory } from 'src/hooks/useReservesHistory';
import { ApyGraph } from './ApyGraph';
import { GraphLegend } from './GraphLegend';
import { GraphTimeRangeSelector } from './GraphTimeRangeSelector';

type Field = 'liquidityRate' | 'stableBorrowRate' | 'variableBorrowRate';

type Fields = { name: Field; color: string; text: string }[];

type ApyGraphContainerKey = 'supply' | 'borrow';

type ApyGraphContainerProps = {
  graphKey: ApyGraphContainerKey;
  reserve: ComputedReserveData;
  lendingPoolAddressProvider: string;
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
  lendingPoolAddressProvider,
}: ApyGraphContainerProps): JSX.Element => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<ReserveRateTimeRange>('1m');

  const CHART_HEIGHT = 300;
  const reserveAddress = reserve ? `${reserve.underlyingAsset}${lendingPoolAddressProvider}` : '';
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

  const GraphLoading = () => (
    <Box
      sx={{
        height: CHART_HEIGHT,
        width: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="subheader1" color="text.muted">
        <Trans>Loading data...</Trans>
      </Typography>
    </Box>
  );

  const GraphError = () => (
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
          loading={loading}
          timeRange={selectedTimeRange}
          handleTimeRangeChanged={setSelectedTimeRange}
        />
      </Box>
      {loading && <GraphLoading />}
      {error && <GraphError />}
      {!loading && !error && (
        <GraphError />
        // <ParentSize>
        //   {({ width }) => (
        //     <ApyGraph width={width} height={CHART_HEIGHT} data={data} fields={fields} />
        //   )}
        // </ParentSize>
      )}
    </Box>
  );
};
