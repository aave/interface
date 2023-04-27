import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { GhoBorrowDiscountPieChart } from './GhoBorrowDiscountPieChart';
import { GhoBorrowTermRange } from './GhoTimeRangeSelector';

interface GhoInterestRateGraphContainerProps {
  borrowAmount: number | null;
  stkAaveAmount: number | null;
  interestOwed: number;
  rateAfterDiscount: number;
  selectedTimeRange: GhoBorrowTermRange;
  onSelectedTimeRangeChanged: (value: GhoBorrowTermRange) => void;
}

interface GhoInterestRatePieChartContainer {
  borrowAmount: number | null;
  discountableAmount: number | null;
  baseRate: number;
  discountedAmountRate: number;
  rateAfterDiscount: number;
}

export const GhoInterestRatePieChartContainer = ({
  borrowAmount,
  discountableAmount,
  baseRate,
  discountedAmountRate,
  rateAfterDiscount,
}: GhoInterestRatePieChartContainer) => {
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));

  const amountAtDiscount = discountableAmount || 0;
  const amountThatExceedsDiscount = Math.max(0, (borrowAmount || 0) - amountAtDiscount);

  const chartData = [
    {
      name: 'amountThatExceedsDiscount',
      value: amountThatExceedsDiscount,
      color: '#B3C7F9',
    },
    {
      name: 'amountAtDiscount',
      value: amountAtDiscount,
      color: '#C9B3F9',
    },
  ];

  if (downToXsm) {
    return (
      <GhoPieMobile
        chartData={chartData}
        rateAfterDiscount={rateAfterDiscount}
        baseRate={baseRate}
        amountAtDiscount={amountAtDiscount}
        discountedAmountRate={discountedAmountRate}
        amountThatExceedsDiscount={amountThatExceedsDiscount}
      />
    );
  } else {
    return (
      <GhoPieDesktop
        chartData={chartData}
        rateAfterDiscount={rateAfterDiscount}
        baseRate={baseRate}
        amountAtDiscount={amountAtDiscount}
        discountedAmountRate={discountedAmountRate}
        amountThatExceedsDiscount={amountThatExceedsDiscount}
      />
    );
  }
};

interface GhoPieProps {
  rateAfterDiscount: number;
  chartData: Array<{ name: string; color: string; value: number }>;
  amountAtDiscount: number;
  discountedAmountRate: number;
  amountThatExceedsDiscount: number;
  baseRate: number;
}

export const GhoPieDesktop = ({
  rateAfterDiscount,
  chartData,
  amountAtDiscount,
  discountedAmountRate,
  amountThatExceedsDiscount,
  baseRate,
}: GhoPieProps) => {
  const theme = useTheme();

  return (
    <Stack
      direction="column"
      sx={{
        position: 'relative',
        background: theme.palette.background.surface2,
        width: '306px',
        height: '320px',
        justifyContent: 'center',
        alignItems: 'center',
        px: 6,
      }}
    >
      <Stack alignItems="center" sx={{ position: 'absolute', top: 70 }}>
        <Typography variant="subheader2">Borrow APY</Typography>
        <FormattedNumber variant="h1" percent value={rateAfterDiscount} visibleDecimals={2} />
      </Stack>
      <GhoBorrowDiscountPieChart data={chartData} width={156} height={156} />
      <Box sx={{ mt: 4 }}>
        <ChartLegend
          amountAtDiscount={amountAtDiscount}
          discountedAmountRate={discountedAmountRate}
          amountThatExceedsDiscount={amountThatExceedsDiscount}
          baseRate={baseRate}
        />
      </Box>
    </Stack>
  );
};

export const GhoPieMobile = ({
  rateAfterDiscount,
  chartData,
  amountAtDiscount,
  discountedAmountRate,
  amountThatExceedsDiscount,
  baseRate,
}: GhoPieProps) => {
  const theme = useTheme();

  return (
    <Stack
      direction="column"
      sx={{
        position: 'relative',
        height: '280px',
        background: theme.palette.background.surface2,
        alignItems: 'center',
        px: 4,
        pt: 2,
      }}
    >
      <Stack alignItems="center" sx={{ position: 'absolute', top: 60 }}>
        <Typography variant="subheader2">Borrow APY</Typography>
        <FormattedNumber
          variant="h1"
          symbolsColor="text.primary"
          percent
          value={rateAfterDiscount}
          visibleDecimals={2}
        />
      </Stack>
      <GhoBorrowDiscountPieChart data={chartData} width={156} height={156} />
      <Box sx={{ width: '100%' }}>
        <ChartLegend
          amountAtDiscount={amountAtDiscount}
          discountedAmountRate={discountedAmountRate}
          amountThatExceedsDiscount={amountThatExceedsDiscount}
          baseRate={baseRate}
        />
      </Box>
    </Stack>
  );
};

interface ChartLegendProps {
  amountAtDiscount: number;
  discountedAmountRate: number;
  amountThatExceedsDiscount: number;
  baseRate: number;
}

const ChartLegend = ({
  amountAtDiscount,
  discountedAmountRate,
  amountThatExceedsDiscount,
  baseRate,
}: ChartLegendProps) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left" sx={{ pl: 0 }}>
              <Typography variant="helperText">Principal balance</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="helperText">Amount</Typography>
            </TableCell>
            <TableCell align="right" sx={{ pr: 0 }}>
              <Typography variant="helperText">APY</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            sx={{
              pt: 8,
              [`& .${tableCellClasses.root}`]: {
                borderBottom: 'none',
                pt: 3,
                pb: 2,
              },
            }}
          >
            <TableCell align="left" sx={{ pl: 0 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    background: '#C9B3F9',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                  }}
                />
                <Typography variant="caption">At a discount</Typography>
              </Stack>
            </TableCell>
            <TableCell align="right">
              <FormattedNumber variant="subheader2" value={amountAtDiscount} align="right" />
            </TableCell>
            <TableCell sx={{ pr: 0 }} align="right">
              <FormattedNumber
                variant="subheader2"
                value={discountedAmountRate}
                percent
                visibleDecimals={2}
              />
            </TableCell>
          </TableRow>
          <TableRow
            sx={{
              [`& .${tableCellClasses.root}`]: {
                borderBottom: 'none',
              },
            }}
          >
            <TableCell align="left" sx={{ pl: 0 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    background: '#B3C7F9',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption">Exceeds the discount</Typography>
              </Stack>
            </TableCell>
            <TableCell align="right">
              <FormattedNumber
                variant="subheader2"
                visibleDecimals={2}
                value={amountThatExceedsDiscount}
              />
            </TableCell>
            <TableCell sx={{ pr: 0 }} align="right">
              <FormattedNumber variant="subheader2" value={baseRate} percent />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
