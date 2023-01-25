import { calculateCompoundedRate, RAY_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Box, Stack, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import dayjs from 'dayjs';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
import { GhoInterestRate, GhoInterestRateGraph } from './GhoInterestRateGraph';
import { GhoBorrowTermRange, GhoTimeRangeSelector } from './GhoTimeRangeSelector';

interface GhoInterestRateGraphContainerProps {
  borrowAmount: number | null;
  stkAaveAmount: number | null;
  interestOwed: number;
  rateAfterDiscount: number;
  selectedTimeRange: GhoBorrowTermRange;
  onSelectedTimeRangeChanged: (value: GhoBorrowTermRange) => void;
}

const calculateDiscountRateData = (
  borrowedGho: number,
  termDuration: number,
  discountableAmount: number,
  ghoBaseVariableBorrowRate: number,
  ghoDiscountRate: number
) => {
  // const discountableAmount = stakedAave * ghoReserveData.ghoDiscountedPerToken;

  // Factor in time for compounding for a final rate, using base variable rate
  // const termDuration = getSecondsForGhoBorrowTermDuration(termDuration);
  const ratePayload = {
    rate: valueToBigNumber(ghoBaseVariableBorrowRate).shiftedBy(RAY_DECIMALS),
    duration: termDuration,
  };
  const newRate = calculateCompoundedRate(ratePayload).shiftedBy(-RAY_DECIMALS).toNumber();
  const borrowRateWithMaxDiscount = newRate * (1 - ghoDiscountRate);
  // Apply discount to the newly compounded rate
  const newBorrowRate = weightedAverageAPY(
    newRate,
    borrowedGho,
    discountableAmount,
    borrowRateWithMaxDiscount
  );

  return {
    baseRate: newRate,
    rateAfterDiscount: newBorrowRate,
    rateAfterMaxDiscount: borrowRateWithMaxDiscount,
  };
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
    const rate = calculateDiscountRateData(
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
          disabled={ghoLoadingData}
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
