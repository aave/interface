import { Box } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { GraphLegend } from './GraphLegend';
import { InterestRateModelGraph } from './InterestRateModelGraph';
import { GHOInterestRateModelGraph } from './GHOInterestRateModelGraph';

export type Field = 'variableBorrowRate' | 'utilizationRate';

export type Fields = { name: Field; color: string; text: string }[];

// This graph takes in its data via props, thus having no loading/error states
export const GHOInterestRateModelGraphContainer = () => {
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
          <GHOInterestRateModelGraph
            width={width}
            height={CHART_HEIGHT}
            fields={fields}
            reserve={{
              baseVariableBorrowRate: "",
              optimalUsageRatio: "",
              utilizationRate: "",
              variableRateSlope1: "",
              variableRateSlope2:"",
              totalLiquidityUSD: "",
              totalDebtUSD: ""
            }}
          />
        )}
      </ParentSize>
    </Box>
  );
};
