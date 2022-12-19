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
} from '@mui/material';
import PercentIcon from 'public/icons/markets/percent-icon.svg';
import React, { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { useRootStore } from 'src/store/root';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
import {
  getSecondsForGhoBorrowTermDuration,
  GhoBorrowTermRange,
  GhoTimeRangeSelector,
} from './GhoTimeRangeSelector';

const sliderStyles = {
  color: '#669AFF',
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

// We start this calculator off showing values to reach max discount
export const GhoDiscountCalculator = () => {
  const {
    ghoLoadingData,
    ghoLoadingMarketData,
    ghoDiscountRatePercent,
    ghoDiscountedPerToken,
    ghoBaseBorrowRate,
    ghoBorrowAPY,
    ghoComputed: { borrowAPYWithMaxDiscount },
  } = useRootStore();
  const discountedPerToken = Number(ghoDiscountedPerToken);
  const [stkAave, setStkAave] = useState<number | null>(100);
  const [ghoBorrow, setGhoBorrow] = useState<number | null>(10000);
  const [selectedTimeRange, setSelectedTimeRange] = useState<GhoBorrowTermRange>(
    ESupportedTimeRanges.OneYear
  );
  const [rateSelection, setRateSelection] = useState<CalculatedRateSelection>({
    baseRate: ghoBorrowAPY,
    rateAfterDiscount: borrowAPYWithMaxDiscount, // Initialize with max discount
    rateAfterMaxDiscount: borrowAPYWithMaxDiscount,
  });
  const [discountableGhoAmount, setDiscountableGhoAmount] = useState<number>(0);
  const loadingGhoData = ghoLoadingData || ghoLoadingMarketData;
  const showDiscountRate =
    (ghoBorrow !== null && stkAave !== null && ghoBorrow > 0 && stkAave > 0) ||
    rateSelection.rateAfterDiscount === rateSelection.rateAfterMaxDiscount;
  const interestOwed = (ghoBorrow || 0) * rateSelection.rateAfterDiscount;

  /**
   * This function recreates the logic that happens in GhoDiscountRateStrategy.sol to determine a user's discount rate for borrowing GHO based off of the amount of stkAAVE a user holds and a given term length
   * This is repeated here so that we don't bombard the RPC with HTTP requests to do this calculation and read from on-chain logic.
   * NOTE: if the discount rate strategy changes on-chain, then this creates a maintenance issue and we'll have to update this.
   * @param stakedAave - The hypothectical amount of stkAAVE
   * @param borrowedGho - The hypothetical amount of GHO
   */
  const calculateDiscountRate = async (stakedAave: number, borrowedGho: number) => {
    const discountableAmount = stakedAave * discountedPerToken;

    // Factor in time for compounding for a final rate, using base variable rate
    const termDuration = getSecondsForGhoBorrowTermDuration(selectedTimeRange);
    const ratePayload = {
      rate: valueToBigNumber(ghoBaseBorrowRate).shiftedBy(RAY_DECIMALS),
      duration: termDuration,
    };
    const newRate = calculateCompoundedRate(ratePayload).shiftedBy(-RAY_DECIMALS).toNumber();
    const borrowRateWithMaxDiscount = newRate * (1 - ghoDiscountRatePercent);
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
        <ReserveOverviewBox title={<Trans>Discountable amount</Trans>}>
          {loading ? (
            <Skeleton variant="text" width={75} />
          ) : (
            <Typography variant="secondary14" display="flex" alignItems="center">
              <TokenIcon symbol="GHO" sx={{ fontSize: '14px', mr: 1 }} />
              {discountedPerToken}
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
        <ReserveOverviewBox title={<Trans>Max discount</Trans>}>
          {loading ? (
            <Skeleton variant="text" width={50} />
          ) : (
            <FormattedNumber
              value={ghoDiscountRatePercent * -1}
              percent
              variant="secondary14"
              color="text.primary"
              sx={{ mr: 1 }}
              visibleDecimals={0}
            />
          )}
        </ReserveOverviewBox>
        <ReserveOverviewBox title={<Trans>APY with max discount</Trans>}>
          {loading ? (
            <Skeleton variant="text" width={50} />
          ) : (
            <FormattedNumber
              value={borrowAPYWithMaxDiscount}
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
      : (ghoBorrow - discountableGhoAmount) / Number(ghoDiscountedPerToken);
    const maxGhoNotBorrowed = ghoBorrow && ghoBorrow < discountableGhoAmount;
    const discountNotAvailable = !stkAave || !ghoBorrow;

    const handleAddStkAaveForMaxDiscount = () => {
      if (stkAave) setStkAave(stkAave + additionalStkAaveToReachMax);
    };

    if (discountNotAvailable)
      return (
        <Typography variant="helperText" component="p" color="warning.dark">
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
      <Grid container spacing={8}>
        <Grid item xs={12} sm={6}>
          <Box mb={2}>
            <Typography variant="subheader2" gutterBottom>
              <Trans>Borrow amount</Trans>
            </Typography>
            {/* TODO: Instead of type="number", look into using TextField component with inputMode and pattern for inputProps: https://mui.com/material-ui/react-text-field/#type-quot-number-quot */}
            <OutlinedInput
              disabled={loadingGhoData}
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
              disabled={loadingGhoData}
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
          <Box mb={8}>
            <Typography variant="subheader2" gutterBottom>
              <Trans>Borrow term</Trans>
            </Typography>
            <GhoTimeRangeSelector
              disabled={loadingGhoData}
              timeRange={selectedTimeRange}
              onTimeRangeChanged={setSelectedTimeRange}
            />
          </Box>
          <Box>
            <Typography variant="subheader2" gutterBottom>
              <Trans>Staked AAVE amount</Trans>
            </Typography>
            {/* TODO: Instead of type="number", look into using TextField component with inputMode and pattern for inputProps: https://mui.com/material-ui/react-text-field/#type-quot-number-quot */}
            <OutlinedInput
              disabled={loadingGhoData}
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
              disabled={loadingGhoData}
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
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subheader2" mb={1.5}>
            <Trans>GHO borrow rate</Trans>
          </Typography>
          {loadingGhoData ? (
            <CircularProgress size={24} sx={{ my: 2, color: '#669AFF' }} />
          ) : (
            <>
              <Box display="flex" alignItems="center" mb={2}>
                <FormattedNumber
                  value={rateSelection.baseRate}
                  percent
                  variant="display1"
                  component="div"
                  color={showDiscountRate ? 'text.muted' : 'text.primary'}
                  symbolsColor={showDiscountRate ? 'text.muted' : 'text.primary'}
                  mr={1}
                  sx={
                    showDiscountRate
                      ? { textDecoration: 'line-through', '.MuiTypography-root': { ml: 0 } }
                      : { '.MuiTypography-root': { ml: 0 } }
                  }
                />
                {showDiscountRate && (
                  <>
                    <FormattedNumber
                      value={rateSelection.rateAfterDiscount}
                      percent
                      variant="display1"
                      component="div"
                      symbolsColor="text.primary"
                      sx={{ '.MuiTypography-root': { ml: 0 } }}
                    />
                    <SvgIcon fontSize="large">
                      <PercentIcon />
                    </SvgIcon>
                  </>
                )}
              </Box>
              <GhoInterestOwedLineComponent />
              <GhoDiscountCalculatorHelperText />
            </>
          )}
        </Grid>
      </Grid>
      <GhoDiscountParametersComponent loading={loadingGhoData} />
    </>
  );
};
