import { calculateCompoundedRate, RAY_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  CircularProgress,
  Grid,
  OutlinedInput,
  Skeleton,
  Slider,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Stack } from '@mui/system';
import { ParentSize } from '@visx/responsive';
import dayjs from 'dayjs';
import React, { Fragment, useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
import { GhoInterestRateGraph } from './GhoInterestRateGraph';
import {
  getSecondsForGhoBorrowTermDuration,
  GhoBorrowTermRange,
  GhoTimeRangeSelector,
} from './GhoTimeRangeSelector';

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

const sliderStyles = {
  color: '#669AFF',
  marginBottom: '8px',
  '.MuiSlider-rail': {
    color: 'text.disabled',
  },
  '.MuiSlider-thumb': {
    boxShadow:
      '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)',
  },
  '.MuiSlider-mark': {
    display: 'none',
  },
  '.MuiSlider-markLabel': {
    top: '24px',
    fontSize: '10px',
    color: 'text.secondary',
    '&[data-index="1"]': {
      transform: 'translateX(-100%)',
    },
    '@media (pointer: coarse)': {
      top: '30px',
    },
  },
};

interface CalculatedRateSelection {
  baseRate: number;
  rateAfterDiscount: number;
  rateAfterMaxDiscount: number;
}

let initialRateValuesSet = false;

// We start this calculator off showing values to reach max discount
export const GhoDiscountCalculator = () => {
  const { ghoLoadingData, ghoReserveData } = useAppDataContext();
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const [stkAave, setStkAave] = useState<number | null>(100);
  const [ghoBorrow, setGhoBorrow] = useState<number | null>(10000);
  const [selectedTimeRange, setSelectedTimeRange] = useState<GhoBorrowTermRange>(
    ESupportedTimeRanges.OneYear
  );
  const [rateSelection, setRateSelection] = useState<CalculatedRateSelection>({
    baseRate: ghoReserveData.ghoVariableBorrowAPY,
    rateAfterDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount, // Initialize with max discount
    rateAfterMaxDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  });
  const [discountableGhoAmount, setDiscountableGhoAmount] = useState<number>(0);
  const showDiscountRate =
    (ghoBorrow !== null && stkAave !== null && ghoBorrow > 0 && stkAave > 0) ||
    rateSelection.rateAfterDiscount === rateSelection.rateAfterMaxDiscount;
  const interestOwed = (ghoBorrow || 0) * rateSelection.rateAfterDiscount;

  useEffect(() => {
    // Inital values come from the store, but if that data is not loaded yet, update it once it is
    if (!ghoLoadingData && !initialRateValuesSet) {
      setRateSelection({
        baseRate: ghoReserveData.ghoVariableBorrowAPY,
        rateAfterDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount,
        rateAfterMaxDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount,
      });
      initialRateValuesSet = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghoLoadingData]);

  /**
   * This function recreates the logic that happens in GhoDiscountRateStrategy.sol to determine a user's discount rate for borrowing GHO based off of the amount of stkAAVE a user holds and a given term length
   * This is repeated here so that we don't bombard the RPC with HTTP requests to do this calculation and read from on-chain logic.
   * NOTE: if the discount rate strategy changes on-chain, then this creates a maintenance issue and we'll have to update this.
   * @param stakedAave - The hypothectical amount of stkAAVE
   * @param borrowedGho - The hypothetical amount of GHO
   */
  const calculateDiscountRate = async (stakedAave: number, borrowedGho: number) => {
    const discountableAmount = stakedAave * ghoReserveData.ghoDiscountedPerToken;

    // Factor in time for compounding for a final rate, using base variable rate
    const termDuration = getSecondsForGhoBorrowTermDuration(selectedTimeRange);
    const ratePayload = {
      rate: valueToBigNumber(ghoReserveData.ghoBaseVariableBorrowRate).shiftedBy(RAY_DECIMALS),
      duration: termDuration,
    };
    const newRate = calculateCompoundedRate(ratePayload).shiftedBy(-RAY_DECIMALS).toNumber();
    const borrowRateWithMaxDiscount = newRate * (1 - ghoReserveData.ghoDiscountRate);
    // Apply discount to the newly compounded rate
    const newBorrowRate = weightedAverageAPY(
      newRate,
      borrowedGho,
      discountableAmount,
      borrowRateWithMaxDiscount
    );

    // Update local state
    setDiscountableGhoAmount(discountableAmount);
    setRateSelection({
      baseRate: newRate,
      rateAfterDiscount: newBorrowRate,
      rateAfterMaxDiscount: borrowRateWithMaxDiscount,
    });
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    calculateDiscountRate(stkAave ?? 0, ghoBorrow ?? 0);
  }, [stkAave, ghoBorrow, selectedTimeRange]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const GhoInterestOwedLineComponent: React.FC = () => (
    <Box my={4} display="flex" alignItems="center">
      <TokenIcon symbol="GHO" fontSize="small" />
      <FormattedNumber value={interestOwed} visibleDecimals={2} variant="main12" sx={{ mx: 1 }} />
      <Typography variant="caption" color="text.secondary">
        <Trans>Interest owed</Trans>
      </Typography>
    </Box>
  );

  const GhoDiscountParametersComponent: React.FC<{ loading: boolean }> = ({ loading }) => (
    <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%', my: 10 }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <Typography variant="secondary14" color="text.secondary">
          <Trans>Discount parameters</Trans>
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          mt: 3,
          mb: 2,
        }}
      >
        <ReserveOverviewBox fullWidth={downToXsm} title={<Trans>Discountable amount</Trans>}>
          {loading ? (
            <Skeleton variant="text" width={75} />
          ) : (
            <Typography variant="secondary14" display="flex" alignItems="center">
              <TokenIcon symbol="GHO" sx={{ fontSize: '14px', mr: 1 }} />
              {ghoReserveData.ghoDiscountedPerToken}
              <Typography
                component="span"
                variant="secondary14"
                color="text.primary"
                sx={{ mx: 1 }}
              >
                <Trans>to</Trans>
              </Typography>{' '}
              <TokenIcon symbol="AAVE" sx={{ fontSize: '14px', mr: 1 }} />1
            </Typography>
          )}
        </ReserveOverviewBox>
        <ReserveOverviewBox fullWidth={downToXsm} title={<Trans>Max discount</Trans>}>
          {loading ? (
            <Skeleton variant="text" width={50} />
          ) : (
            <FormattedNumber
              value={ghoReserveData.ghoDiscountRate * -1}
              percent
              variant="secondary14"
              color="text.primary"
              sx={{ mr: 1 }}
              visibleDecimals={0}
            />
          )}
        </ReserveOverviewBox>
        <ReserveOverviewBox fullWidth={downToXsm} title={<Trans>APY with max discount</Trans>}>
          {loading ? (
            <Skeleton variant="text" width={50} />
          ) : (
            <FormattedNumber
              value={ghoReserveData.ghoBorrowAPYWithMaxDiscount}
              percent
              variant="secondary14"
              color="text.primary"
            />
          )}
        </ReserveOverviewBox>
      </Box>
      <Typography variant="caption" color="text.secondary">
        <Trans>
          Discount parameters are decided by the Aave community and may be changed over time. Check
          Governance for updates and vote to participate.{' '}
          <Link
            href="https://governance.aave.com"
            sx={{ textDecoration: 'underline' }}
            variant="caption"
            color="text.secondary"
          >
            Learn more
          </Link>
        </Trans>
      </Typography>
    </Box>
  );

  const GhoDiscountCalculatorHelperText: React.FC = () => {
    const maxDiscountNotReached = ghoBorrow && discountableGhoAmount < ghoBorrow;
    const additionalStkAaveToReachMax = !maxDiscountNotReached
      ? 0
      : (ghoBorrow - discountableGhoAmount) / Number(ghoReserveData.ghoDiscountedPerToken);
    const maxGhoNotBorrowed = ghoBorrow && ghoBorrow < discountableGhoAmount;
    const discountNotAvailable = !stkAave || !ghoBorrow;

    const handleAddStkAaveForMaxDiscount = () => {
      if (stkAave) setStkAave(stkAave + additionalStkAaveToReachMax);
    };

    if (discountNotAvailable)
      return (
        <Typography variant="caption" component="p" color="warning.dark">
          <Trans>Add stkAAVE to see borrow APY with the discount</Trans>
        </Typography>
      );

    if (maxDiscountNotReached)
      return (
        <Typography variant="caption" component="p" color="text.secondary">
          <Trans>
            <Typography
              component="span"
              variant="subheader2"
              onClick={handleAddStkAaveForMaxDiscount}
              sx={{
                color: '#669AFF',
                '&:hover': { textDecoration: 'underline', cursor: 'pointer' },
              }}
            >
              <SvgIcon sx={{ fontSize: '14px', verticalAlign: 'middle', marginBottom: '3px' }}>
                <AddIcon />
              </SvgIcon>
              Add {additionalStkAaveToReachMax} stkAAVE
            </Typography>{' '}
            to borrow at{' '}
            <FormattedNumber
              value={rateSelection.rateAfterMaxDiscount}
              percent
              variant="caption"
              symbolsColor="text.secondary"
              sx={{ '.MuiTypography-root': { ml: 0 } }}
            />{' '}
            (max discount)
          </Trans>
        </Typography>
      );

    if (maxGhoNotBorrowed)
      return (
        <Typography variant="caption" component="p" color="text.secondary">
          <Trans>
            You may borrow up to {discountableGhoAmount} GHO at{' '}
            <FormattedNumber
              value={rateSelection.rateAfterMaxDiscount}
              percent
              variant="caption"
              symbolsColor="text.secondary"
              sx={{ '.MuiTypography-root': { ml: 0 } }}
            />{' '}
            (max discount)
          </Trans>
        </Typography>
      );

    // Return nothing if max discount has been reached with maximum borrowed, and also as a fallback
    return <></>;
  };

  const data = [];
  const now = dayjs().unix() * 1000;
  const oneDay = dayjs.duration({ days: 1 }).asSeconds();

  // TODO: optimize this, we don't need every day for the graph
  let duration = 365;
  if (selectedTimeRange === ESupportedTimeRanges.TwoYears) duration = 365 * 2;
  if (selectedTimeRange === ESupportedTimeRanges.FiveYears) duration = 365 * 5;

  for (let i = 0; i < duration; i++) {
    const rate = calculateDiscountRateData(
      ghoBorrow ?? 0,
      oneDay * i,
      (stkAave ?? 0) * ghoReserveData.ghoDiscountedPerToken,
      ghoReserveData.ghoBaseVariableBorrowRate,
      ghoReserveData.ghoDiscountRate
    );
    const interestAccrued = (ghoBorrow || 0) * rate.rateAfterDiscount;
    data.push({
      date: now + oneDay * i * 1000,
      interestRate: rate.rateAfterDiscount,
      accruedInterest: interestAccrued,
    });
  }

  // TODO: probably don't need this, holdover from the current ApyGraph
  const fields = [{ name: 'interestRate', color: '#2EBAC6', text: 'Supply APR' }];

  return (
    <>
      <Typography variant="subheader1" gutterBottom>
        <Trans>Stake AAVE to borrow GHO at a discount</Trans>
      </Typography>
      <Typography variant="caption" color="text.secondary" mb={6}>
        <Trans>
          For each staked AAVE, Safety Module participants may borrow GHO with lower interest rate.
          Use the calculator below to see different borrow rates with the discount applied.
        </Trans>
      </Typography>
      <Stack direction="row" gap={2}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="subheader2" gutterBottom>
            <Trans>Borrow amount</Trans>
          </Typography>
          {/* TODO: Instead of type="number", look into using TextField component with inputMode and pattern for inputProps: https://mui.com/material-ui/react-text-field/#type-quot-number-quot */}
          <OutlinedInput
            disabled={ghoLoadingData}
            fullWidth
            value={ghoBorrow ?? ''}
            placeholder="0"
            endAdornment={<TokenIcon symbol="GHO" />}
            inputProps={{
              min: 0,
              sx: { py: 2, px: 3, fontSize: '21px' },
            }}
            onChange={(e) =>
              e.target.value === '' || Number(e.target.value) <= 0
                ? setGhoBorrow(null)
                : setGhoBorrow(Number(e.target.value))
            }
            type="number"
          />
          <Slider
            disabled={ghoLoadingData}
            size="small"
            value={ghoBorrow ?? 0}
            onChange={(_, val) => setGhoBorrow(Number(val))}
            step={1000}
            min={0}
            max={100000}
            marks={[
              { value: 0, label: '0' },
              { value: 100000, label: '100,000' },
            ]}
            sx={sliderStyles}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <Typography variant="subheader2" gutterBottom>
            <Trans>Staked AAVE amount</Trans>
          </Typography>
          {/* TODO: Instead of type="number", look into using TextField component with inputMode and pattern for inputProps: https://mui.com/material-ui/react-text-field/#type-quot-number-quot */}
          <OutlinedInput
            disabled={ghoLoadingData}
            fullWidth
            value={stkAave ?? ''}
            placeholder="0"
            endAdornment={<TokenIcon symbol="AAVE" />}
            inputProps={{
              min: 0,
              sx: { py: 2, px: 3, fontSize: '21px' },
            }}
            onChange={(e) =>
              e.target.value === '' || Number(e.target.value) <= 0
                ? setStkAave(null)
                : setStkAave(Number(e.target.value))
            }
            type="number"
          />
          <Slider
            disabled={ghoLoadingData}
            size="small"
            value={stkAave ?? 0}
            onChange={(_, val) => setStkAave(Number(val))}
            step={5}
            min={0}
            max={1000}
            marks={[
              { value: 0, label: '0' },
              { value: 1000, label: '1,000' },
            ]}
            sx={sliderStyles}
          />
        </Box>
      </Stack>
      <Box sx={{ minHeight: '35px' }}>
        <GhoDiscountCalculatorHelperText />
      </Box>
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
                value={rateSelection.rateAfterDiscount}
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
            onTimeRangeChanged={setSelectedTimeRange}
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
      <GhoDiscountParametersComponent loading={ghoLoadingData} />
    </>
  );
};
