import { useState } from 'react';
import { Box } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ReserveRateTimeRange } from 'src/hooks/useReservesHistory';
import { GraphLegend } from './GraphLegend';
import { GraphTimeRangeSelector } from './GraphTimeRangeSelector';
import { InterestRateModelGraph } from './InterestRateModelGraph';

type InteresetRateModelGraphContainerProps = {
  reserve: ComputedReserveData;
};

export type Field = 'liquidityRate' | 'stableBorrowRate' | 'variableBorrowRate';

export type Fields = { name: Field; color: string; text: string }[];

// This graph takes in its data via props, thus having no loading/error states
export const InteresetRateModelGraphContainer = ({
  reserve,
}: InteresetRateModelGraphContainerProps): JSX.Element => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<ReserveRateTimeRange>('1m');

  const CHART_HEIGHT = 300;
  const fields: Fields = [
    { name: 'liquidityRate', text: 'Supply APR', color: '#2EBAC6' },
    { name: 'variableBorrowRate', text: 'Borrow APR, variable', color: '#B6509E' },
    ...(reserve.stableBorrowRateEnabled
      ? ([{ name: 'stableBorrowRate', text: 'Borrow APR, stable', color: '#E7C6DF' }] as const)
      : []),
  ];

  return (
    <Box sx={{ mt: 8, mb: 10 }}>
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
          timeRange={selectedTimeRange}
          handleTimeRangeChanged={setSelectedTimeRange}
        />
      </Box>
      <ParentSize>
        {({ width }) => (
          <InterestRateModelGraph
            width={width}
            height={CHART_HEIGHT}
            fields={fields}
            reserve={{
              supplyAPR: reserve.supplyAPR,
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
