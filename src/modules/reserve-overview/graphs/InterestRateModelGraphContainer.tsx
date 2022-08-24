import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { Box, Button, ButtonGroup, useTheme } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { GraphMetaHeaderItem } from './GraphMetaHeaderItem';
import { GraphLegend } from './GraphLegend';
import { InterestRateModelGraph } from './InterestRateModelGraph';
import { GraphTimeRangeSelector } from './GraphTimeRangeSelector';

type InteresetRateModelGraphContainerProps = {
  reserve: ComputedReserveData;
};

export const InteresetRateModelGraphContainer = ({
  reserve,
}: InteresetRateModelGraphContainerProps): JSX.Element => {
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
        <GraphTimeRangeSelector />
      </Box>
      <ParentSize>
        {({ width }) => (
          <InterestRateModelGraph
            width={width}
            height={300}
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
