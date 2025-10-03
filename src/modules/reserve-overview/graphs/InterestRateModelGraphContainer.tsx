import { Box } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import type { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';

import { GraphLegend } from './GraphLegend';
import { InterestRateModelGraph } from './InterestRateModelGraph';

type InteresetRateModelGraphContainerProps = {
  reserve: ReserveWithId;
};

export type Field = 'variableBorrowRate' | 'utilizationRate';

export type Fields = { name: Field; color: string; text: string }[];

// This graph takes in its data via props, thus having no loading/error states
export const InterestRateModelGraphContainer = ({
  reserve,
}: InteresetRateModelGraphContainerProps): JSX.Element => {
  const CHART_HEIGHT = 155;
  const fields: Fields = [
    { name: 'variableBorrowRate', text: 'Borrow APR, variable', color: '#B6509E' },
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
        <GraphLegend labels={[...fields, { text: 'Utilization Rate', color: '#0062D2' }]} />
      </Box>
      <ParentSize>
        {({ width }) => (
          <InterestRateModelGraph
            width={width}
            height={CHART_HEIGHT}
            fields={fields}
            reserve={{
              baseVariableBorrowRate: String(reserve.borrowInfo?.reserveFactor.raw),
              optimalUsageRatio: String(reserve.borrowInfo?.optimalUsageRate.raw),
              utilizationRate: String(reserve.borrowInfo?.utilizationRate.value),
              variableRateSlope1: String(reserve.borrowInfo?.variableRateSlope1.raw),
              variableRateSlope2: String(reserve.borrowInfo?.variableRateSlope2.raw),
              totalLiquidityUSD: reserve.size.usd,
              totalDebtUSD: String(reserve.borrowInfo?.total.usd),
            }}
          />
        )}
      </ParentSize>
    </Box>
  );
};
