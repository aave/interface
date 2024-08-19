import { Box, useTheme } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

import { GraphLegend } from './GraphLegend';
import { InterestRateModelGraph } from './InterestRateModelGraph';

type InteresetRateModelGraphContainerProps = {
  reserve: ComputedReserveData;
};

export type Field = 'stableBorrowRate' | 'variableBorrowRate' | 'utilizationRate';

export type Fields = { name: Field; color: string; text: string }[];

// This graph takes in its data via props, thus having no loading/error states
export const InterestRateModelGraphContainer = ({
  reserve,
}: InteresetRateModelGraphContainerProps): JSX.Element => {
  const theme = useTheme();
  const CHART_HEIGHT = 253;
  const fields: Fields = [
    {
      name: 'variableBorrowRate',
      text: 'Borrow APR, variable',
      color: theme.palette.point.negative,
    },
    ...(reserve.stableBorrowRateEnabled
      ? ([
          {
            name: 'stableBorrowRate',
            text: 'Borrow APR, stable',
            color: theme.palette.point.primary,
          },
        ] as const)
      : []),
  ];

  return (
    <Box sx={{ maxWidth: { xs: '100%', mdlg: 450 }, width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <GraphLegend labels={[...fields, { text: 'Utilization Rate', color: '#0062D2' }]} />
      </Box>
      <ParentSize>
        {({ width }) => (
          <InterestRateModelGraph
            width={width}
            height={CHART_HEIGHT}
            fields={fields}
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
              totalLiquidityUSD: reserve.totalLiquidityUSD,
              totalDebtUSD: reserve.totalDebtUSD,
            }}
          />
        )}
      </ParentSize>
    </Box>
  );
};
