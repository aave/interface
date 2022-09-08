import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { GraphMetaHeaderItem } from './GraphMetaHeaderItem';
import { ReserveRateTimeRange } from 'src/hooks/useReservesHistory';
import { GraphLegend } from './GraphLegend';
import { GraphTimeRangeSelector } from './GraphTimeRangeSelector';
import { InterestRateModelGraph } from './InterestRateModelGraph';

type InteresetRateModelGraphContainerProps = {
  reserve: ComputedReserveData;
};

// This graph takes in its data via props, thus having no loading/error states
export const InteresetRateModelGraphContainer = ({
  reserve,
}: InteresetRateModelGraphContainerProps): JSX.Element => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<ReserveRateTimeRange>('1m');

  const CHART_HEIGHT = 300;
  const theme = useTheme();
  const utilizationColor = theme.palette.mode === 'dark' ? '#fff' : '#000';

  return (
    <Box sx={{ mb: 10 }}>
      <GraphMetaHeaderItem title="Utilization Rate" metaValue="40.9%" />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <GraphLegend
          labels={[
            { text: 'Utilization rate', color: utilizationColor },
            { text: 'Borrow APR, variable', color: '#B6509E' },
            ...(reserve.stableBorrowRateEnabled
              ? ([{ text: 'Borrow APR, stable', color: '#0062D2' }] as const)
              : []),
          ]}
        />
        <GraphTimeRangeSelector
          timeRange={selectedTimeRange}
          handleTimeRangeChanged={setSelectedTimeRange}
        />
      </Box>
      <ParentSize>
        {({ width }) => (
          <InterestRateModelGraph
            width={width}
            height={CHART_HEIGHT}
            reserve={{
              baseStableBorrowRate: reserve.baseStableBorrowRate,
              baseVariableBorrowRate: reserve.baseVariableBorrowRate,
              optimalUsageRatio: reserve.optimalUsageRatio,
              stableRateSlope1: reserve.stableRateSlope1,
              stableRateSlope2: reserve.stableRateSlope2,
              utilizationRate: reserve.borrowUsageRatio,
              variableRateSlope1: reserve.variableRateSlope1,
              variableRateSlope2: reserve.variableRateSlope2,
              stableBorrowRateEnabled: reserve.stableBorrowRateEnabled,
            }}
          />
        )}
      </ParentSize>
    </Box>
  );
};
