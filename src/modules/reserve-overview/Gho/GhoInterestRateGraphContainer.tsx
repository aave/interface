import { Trans } from '@lingui/macro';
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
import { ParentSize } from '@visx/responsive';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
import { GhoBorrowDiscountPieChart } from './GhoBorrowDiscountPieChart';
import { GhoInterestRate, GhoInterestRateGraph } from './GhoInterestRateGraph';
import { GhoBorrowTermRange, GhoTimeRangeSelector } from './GhoTimeRangeSelector';
import { calculateDiscountRate } from './utils';

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
  const theme = useTheme();

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
      <GhoBorrowDiscountPieChart data={chartData} />
      <Box sx={{ mt: 4 }}>
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
                  [`& .${tableCellClasses.root}`]: {
                    borderBottom: 'none',
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
                <TableCell>
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
      </Box>
    </Stack>
  );
};

export const GhoInterestRateGraphContainer = ({
  borrowAmount,
  stkAaveAmount,
  interestOwed,
  rateAfterDiscount,
  selectedTimeRange,
  onSelectedTimeRangeChanged,
}: GhoInterestRateGraphContainerProps) => {
  const { ghoLoadingData, ghoReserveData } = useAppDataContext();
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));

  const graphData = useMemo(() => {
    const data: GhoInterestRate[] = [];
    const now = dayjs().unix() * 1000;

    let duration = 365;
    if (selectedTimeRange === ESupportedTimeRanges.TwoYears) duration = 365 * 2;
    if (selectedTimeRange === ESupportedTimeRanges.FiveYears) duration = 260; // weekly

    let elapsedTime = dayjs.duration({ days: 1 }).asSeconds();
    if (selectedTimeRange === ESupportedTimeRanges.FiveYears) {
      elapsedTime = dayjs.duration({ weeks: 1 }).asSeconds();
    }
    for (let i = 0; i < duration; i++) {
      const rate = calculateDiscountRate(
        borrowAmount ?? 0,
        elapsedTime * i,
        (stkAaveAmount ?? 0) * ghoReserveData.ghoDiscountedPerToken,
        ghoReserveData.ghoBaseVariableBorrowRate,
        ghoReserveData.ghoDiscountRate
      );

      const accruedInterest = (borrowAmount || 0) * rate.baseRate;
      const accruedInterestWithDiscount = (borrowAmount || 0) * rate.rateAfterDiscount;
      const stakingDiscount = accruedInterest - accruedInterestWithDiscount;

      data.push({
        date: now + elapsedTime * i * 1000,
        interestRate: rate.rateAfterDiscount,
        accruedInterest,
        accruedInterestWithDiscount,
        stakingDiscount,
      });
    }
    return data;
  }, [
    borrowAmount,
    stkAaveAmount,
    selectedTimeRange,
    ghoReserveData.ghoDiscountedPerToken,
    ghoReserveData.ghoBaseVariableBorrowRate,
    ghoReserveData.ghoDiscountRate,
  ]);

  if (downToXsm) {
    return (
      <GhoInterestRateGraphMobileContainer
        data={graphData}
        loading={ghoLoadingData}
        borrowAmount={borrowAmount}
        stkAaveAmount={stkAaveAmount}
        interestOwed={interestOwed}
        rateAfterDiscount={rateAfterDiscount}
        selectedTimeRange={selectedTimeRange}
        onSelectedTimeRangeChanged={onSelectedTimeRangeChanged}
      />
    );
  } else {
    return (
      <GhoInterestRateGraphDesktopContainer
        data={graphData}
        loading={ghoLoadingData}
        borrowAmount={borrowAmount}
        stkAaveAmount={stkAaveAmount}
        interestOwed={interestOwed}
        rateAfterDiscount={rateAfterDiscount}
        selectedTimeRange={selectedTimeRange}
        onSelectedTimeRangeChanged={onSelectedTimeRangeChanged}
      />
    );
  }
};

interface GhoInterestRateContainerProps {
  data: GhoInterestRate[];
  loading: boolean;
  borrowAmount: number | null;
  stkAaveAmount: number | null;
  interestOwed: number;
  rateAfterDiscount: number;
  selectedTimeRange: GhoBorrowTermRange;
  onSelectedTimeRangeChanged: (value: GhoBorrowTermRange) => void;
}

const GhoInterestRateGraphDesktopContainer = ({
  data,
  loading,
  interestOwed,
  rateAfterDiscount,
  selectedTimeRange,
  onSelectedTimeRangeChanged,
}: GhoInterestRateContainerProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={4}>
          <Stack>
            <Typography variant="subheader2">
              <Trans>GHO effective interest rate</Trans>
            </Typography>
            <FormattedNumber
              value={rateAfterDiscount}
              percent
              variant="h2"
              component="div"
              symbolsColor="text.primary"
              sx={{ '.MuiTypography-root': { ml: 0 } }}
            />
          </Stack>
          <Stack>
            <Typography variant="subheader2">
              <Trans>Total interest accrued</Trans>
            </Typography>
            <Stack direction="row" alignItems="center">
              <TokenIcon symbol="GHO" fontSize="small" />
              <FormattedNumber
                value={interestOwed}
                visibleDecimals={2}
                variant="h2"
                sx={{ mx: 1 }}
              />
            </Stack>
          </Stack>
        </Stack>
        <GhoTimeRangeSelector
          disabled={loading}
          timeRange={selectedTimeRange}
          onTimeRangeChanged={onSelectedTimeRangeChanged}
        />
      </Box>
      <ParentSize>
        {({ width }) => (
          <GhoInterestRateGraph
            width={width}
            height={240}
            data={data}
            selectedTimeRange={selectedTimeRange}
          />
        )}
      </ParentSize>
    </Box>
  );
};

const GhoInterestRateGraphMobileContainer = ({
  data,
  loading,
  interestOwed,
  rateAfterDiscount,
  selectedTimeRange,
  onSelectedTimeRangeChanged,
}: GhoInterestRateContainerProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack>
          <Typography variant="subheader2">
            <Trans>GHO effective interest rate</Trans>
          </Typography>
          <FormattedNumber
            value={rateAfterDiscount}
            percent
            variant="h1"
            component="div"
            symbolsColor="text.primary"
            sx={{ '.MuiTypography-root': { ml: 0 } }}
          />
        </Stack>
        <Stack>
          <Typography sx={{ ml: 'auto' }} variant="subheader2">
            <Trans>Total interest accrued</Trans>
          </Typography>
          <Stack sx={{ ml: 'auto' }} direction="row" alignItems="center">
            <TokenIcon symbol="GHO" fontSize="small" />
            <FormattedNumber value={interestOwed} visibleDecimals={2} variant="h1" sx={{ ml: 1 }} />
          </Stack>
        </Stack>
      </Box>
      <ParentSize>
        {({ width }) => (
          <GhoInterestRateGraph
            width={width}
            height={280}
            data={data}
            selectedTimeRange={selectedTimeRange}
          />
        )}
      </ParentSize>
      <Box sx={{ mt: 3, mb: 4 }}>
        <GhoTimeRangeSelector
          disabled={loading}
          timeRange={selectedTimeRange}
          onTimeRangeChanged={onSelectedTimeRangeChanged}
          sx={{ button: { width: '100%' }, buttonGroup: { width: '100%' } }}
        />
      </Box>
    </Box>
  );
};
