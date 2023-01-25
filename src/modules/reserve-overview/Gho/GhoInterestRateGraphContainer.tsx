import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import dayjs from 'dayjs';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
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

  // TODO: probably don't need this, holdover from the current ApyGraph
  const fields = [{ name: 'interestRate', color: '#2EBAC6', text: 'Supply APR' }];

  if (downToXsm) {
    return (
      <GhoInterestRateGraphMobileContainer
        data={data}
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
        data={data}
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
  // TODO: probably don't need this, holdover from the current ApyGraph
  const fields = [{ name: 'interestRate', color: '#2EBAC6', text: 'Supply APR' }];

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
            <Typography variant="subheader2">GHO effective interest rate</Typography>
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
            <Typography variant="subheader2">Total interest accrued</Typography>
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
            fields={fields}
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
  // TODO: probably don't need this, holdover from the current ApyGraph
  const fields = [{ name: 'interestRate', color: '#2EBAC6', text: 'Supply APR' }];

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
          <Typography variant="subheader2">GHO effective interest rate</Typography>
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
          <Typography variant="subheader2">Total interest accrued</Typography>
          <Stack direction="row" alignItems="center">
            <TokenIcon symbol="GHO" fontSize="small" />
            <FormattedNumber value={interestOwed} visibleDecimals={2} variant="h2" sx={{ mx: 1 }} />
          </Stack>
        </Stack>
      </Box>
      <ParentSize>
        {({ width }) => (
          <GhoInterestRateGraph
            width={width}
            height={280}
            data={data}
            fields={fields}
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
