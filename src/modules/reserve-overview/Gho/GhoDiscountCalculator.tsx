import { Trans } from '@lingui/macro';
import AddIcon from '@mui/icons-material/Add';
import { Box, Skeleton, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
import { CalculatorInput } from './CalculatorInput';
import { GhoInterestRateGraphContainer } from './GhoInterestRateGraphContainer';
import { getSecondsForGhoBorrowTermDuration, GhoBorrowTermRange } from './GhoTimeRangeSelector';
import { calculateDiscountRate } from './utils';

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
          <CalculatorInput
            title="Borrow amount"
            value={ghoBorrow}
            disabled={ghoLoadingData}
            tokenSymbol="GHO"
            onValueChanged={(value) => setGhoBorrow(value)}
            sliderMax={100000}
            helperTextComponent={<BorrowAmountHelperText />}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <CalculatorInput
            title="Staked AAVE amount"
            value={stkAave}
            disabled={ghoLoadingData}
            tokenSymbol="AAVE"
            onValueChanged={(value) => setStkAave(value)}
            sliderMax={1000}
            helperTextComponent={<StkAaveAmountHelperText />}
          />
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
          <CalculatorInput
            title="Borrow amount"
            value={ghoBorrow}
            disabled={ghoLoadingData}
            tokenSymbol="GHO"
            onValueChanged={(value) => setGhoBorrow(value)}
            sliderMax={100000}
            helperTextComponent={<BorrowAmountHelperText />}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <CalculatorInput
            title="Staked AAVE amount"
            value={stkAave}
            disabled={ghoLoadingData}
            tokenSymbol="AAVE"
            onValueChanged={(value) => setStkAave(value)}
            sliderMax={1000}
            helperTextComponent={<StkAaveAmountHelperText />}
          />
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
