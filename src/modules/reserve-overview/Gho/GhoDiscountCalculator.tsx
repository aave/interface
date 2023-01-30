import { Trans } from '@lingui/macro';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  OutlinedInput,
  Skeleton,
  Slider,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
import { GhoInterestRateGraphContainer } from './GhoInterestRateGraphContainer';
import { getSecondsForGhoBorrowTermDuration, GhoBorrowTermRange } from './GhoTimeRangeSelector';
import { calculateDiscountRate } from './utils';

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

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const stkAaveAmount = stkAave ?? 0;
    const ghoBorrowAmount = ghoBorrow ?? 0;
    const discountableAmount = stkAaveAmount * ghoReserveData.ghoDiscountedPerToken;
    const termDuration = getSecondsForGhoBorrowTermDuration(selectedTimeRange);
    const calculatedRate = calculateDiscountRate(
      ghoBorrowAmount,
      termDuration,
      discountableAmount,
      ghoReserveData.ghoBaseVariableBorrowRate,
      ghoReserveData.ghoDiscountRate
    );

    setDiscountableGhoAmount(discountableAmount);
    setRateSelection({
      baseRate: calculatedRate.baseRate,
      rateAfterDiscount: calculatedRate.rateAfterDiscount,
      rateAfterMaxDiscount: calculatedRate.rateAfterMaxDiscount,
    });
  }, [stkAave, ghoBorrow, selectedTimeRange]);

  const GhoDiscountParametersComponent: React.FC<{ loading: boolean }> = ({ loading }) => (
    <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
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

  const BorrowAmountHelperText: React.FC = () => {
    const maxGhoNotBorrowed = ghoBorrow && ghoBorrow < discountableGhoAmount;

    if (maxGhoNotBorrowed) {
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
    }

    return <></>;
  };

  const StkAaveAmountHelperText: React.FC = () => {
    const maxDiscountNotReached = ghoBorrow && discountableGhoAmount < ghoBorrow;
    const additionalStkAaveToReachMax = !maxDiscountNotReached
      ? 0
      : (ghoBorrow - discountableGhoAmount) / Number(ghoReserveData.ghoDiscountedPerToken);
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

    // Return nothing if max discount has been reached with maximum borrowed, and also as a fallback
    return <></>;
  };

  const GhoDiscountCalculatorDesktop = (
    <>
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
          <Box sx={{ minHeight: '35px' }}>
            <BorrowAmountHelperText />
          </Box>
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
          <Box sx={{ minHeight: '35px' }}>
            <StkAaveAmountHelperText />
          </Box>
        </Box>
      </Stack>
      <GhoInterestRateGraphContainer
        borrowAmount={ghoBorrow}
        stkAaveAmount={stkAave}
        rateAfterDiscount={rateSelection.rateAfterDiscount}
        interestOwed={interestOwed}
        selectedTimeRange={selectedTimeRange}
        onSelectedTimeRangeChanged={setSelectedTimeRange}
      />
    </>
  );

  const GhoDiscountCalculatorMobile = (
    <>
      <GhoInterestRateGraphContainer
        borrowAmount={ghoBorrow}
        stkAaveAmount={stkAave}
        rateAfterDiscount={rateSelection.rateAfterDiscount}
        interestOwed={interestOwed}
        selectedTimeRange={selectedTimeRange}
        onSelectedTimeRangeChanged={setSelectedTimeRange}
      />
      <Stack gap={2}>
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
          <Box sx={{ minHeight: '35px' }}>
            <BorrowAmountHelperText />
          </Box>
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
          <Box sx={{ minHeight: '35px' }}>
            <StkAaveAmountHelperText />
          </Box>
        </Box>
      </Stack>
    </>
  );

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
      {downToXsm ? GhoDiscountCalculatorMobile : GhoDiscountCalculatorDesktop}
      <Box sx={{ my: downToXsm ? 4 : 10 }}>
        <GhoDiscountParametersComponent loading={ghoLoadingData} />
      </Box>
    </>
  );
};
