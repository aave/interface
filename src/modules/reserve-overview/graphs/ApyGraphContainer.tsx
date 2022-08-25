import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { Box } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { ApyGraph } from './ApyGraph';
import { GraphLegend } from './GraphLegend';
import { FormattedReserveHistoryItem, useReserveRatesHistory } from 'src/hooks/useReservesHistory';
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
 */
export const ApyGraphContainer = ({
  graphKey,
  reserve,
  lendingPoolAddressProvider,
}: ApyGraphContainerProps): JSX.Element => {
  const { data, loading, error } = useReserveRatesHistory(
    reserve ? `${reserve.underlyingAsset}${lendingPoolAddressProvider}` : ''
  );

  // Supply fields
  const supplyFields: Fields = [{ name: 'liquidityRate', color: '#2EBAC6', text: 'Supply APR' }];

  // Borrow fields
  const borrowFields: Fields = [
    ...(reserve.stableBorrowRateEnabled
      ? ([
          {
            name: 'stableBorrowRate',
            color: '#0062D2',
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
        <GraphTimeRangeSelector />
      </Box>
      <ParentSize>
        {({ width }) => <ApyGraph width={width} height={300} data={data} fields={fields} />}
      </ParentSize>
    </Box>
  );
};
