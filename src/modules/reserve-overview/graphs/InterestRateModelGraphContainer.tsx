import { Box } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { GraphLegend } from './GraphLegend';
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
  const CHART_HEIGHT = 155;
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
      </Box>
      <ParentSize>
        {({ width }) => (
          <InterestRateModelGraph
            width={width}
            height={CHART_HEIGHT}
            fields={fields}
            reserve={{
              reserveFactor: reserve.reserveFactor,
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
