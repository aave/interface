import { Box, useTheme } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { type ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { pickFigma } from 'src/utils/figmaColors';

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
  const { palette } = useTheme();
  const fields: Fields = [
    {
      name: 'variableBorrowRate',
      text: 'Borrow APR, variable',
      color: pickFigma(palette.mode)['data-orange'],
    },
  ];

  return (
    <Box sx={{ mt: '2.5rem', height: '15rem' }}>
      <ParentSize>
        {({ width, height }) => (
          <InterestRateModelGraph
            width={width}
            height={height}
            fields={fields}
            reserve={{
              baseVariableBorrowRate: String(reserve.borrowInfo?.baseVariableBorrowRate.raw),
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
