import { Trans } from '@lingui/macro';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Skeleton, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ESupportedTimeRanges } from '../TimeRangeSelector';
import { CalculatorInput } from './CalculatorInput';
import { GhoPieChartContainer } from './GhoPieChartContainer';
import { getSecondsForGhoBorrowTermDuration } from './GhoTimeRangeSelector';
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
  const { breakpoints, palette } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));

  const [stkAave, setStkAave] = useState<number | null>(100);
  const [ghoBorrow, setGhoBorrow] = useState<number | null>(10000);

  const [rateSelection, setRateSelection] = useState<CalculatedRateSelection>({
    baseRate: ghoReserveData.ghoVariableBorrowAPY,
    rateAfterDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount, // Initialize with max discount
    rateAfterMaxDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  });
  const [discountableGhoAmount, setDiscountableGhoAmount] = useState<number>(0);

  // We're assuming a one year borrow term for the rate calculations
  const selectedTimeRange = ESupportedTimeRanges.OneYear;

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
    const discountableAmount = Math.round(stkAaveAmount * ghoReserveData.ghoDiscountedPerToken);
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
        <Typography variant="subheader1">
          <Trans>Discount model parameters</Trans>
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
              <TokenIcon symbol="stkAAVE" sx={{ fontSize: '14px', mr: 1 }} />1
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

  const StakingDiscountAlert = () => {
    const maxGhoNotBorrowed = ghoBorrow && ghoBorrow < discountableGhoAmount;
    const maxDiscountNotReached = ghoBorrow && discountableGhoAmount < ghoBorrow;
    const additionalStkAaveToReachMax = !maxDiscountNotReached
      ? 0
      : (ghoBorrow - discountableGhoAmount) / Number(ghoReserveData.ghoDiscountedPerToken);

    const handleAddStkAaveForMaxDiscount = () => {
      if (stkAave) {
        setStkAave(stkAave + additionalStkAaveToReachMax);
      } else {
        // reset to default
        setGhoBorrow(10000);
        setStkAave(100);
      }
    };

    let alertText = null;

    if (maxGhoNotBorrowed) {
      alertText = (
        <Typography variant="caption" component="p" color="text.secondary">
          <Trans>
            You may borrow up to{' '}
            <FormattedNumber
              value={discountableGhoAmount}
              variant="caption"
              color="text.secondary"
              visibleDecimals={2}
            />{' '}
            GHO at{' '}
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

    if (!stkAave)
      alertText = (
        <Typography variant="caption" component="p" color="warning.dark">
          <Trans>Add stkAAVE to see borrow APY with the discount</Trans>
        </Typography>
      );

    if (maxDiscountNotReached)
      alertText = (
        <Typography variant="caption" component="p" color="text.secondary">
          <Trans>
            <Typography
              component="span"
              variant="subheader2"
              color="text.highlight"
              onClick={handleAddStkAaveForMaxDiscount}
              sx={{
                '&:hover': {
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '.MuiTypography-root': {
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              <SvgIcon sx={{ fontSize: '14px', verticalAlign: 'middle', marginBottom: '3px' }}>
                <AddIcon />
              </SvgIcon>
              <Trans>
                Add{' '}
                {discountableGhoAmount > 0 ? (
                  <>
                    <FormattedNumber
                      value={additionalStkAaveToReachMax}
                      variant="subheader2"
                      visibleDecimals={2}
                      sx={{
                        '.MuiTypography-root': { ml: 0 },
                      }}
                    />{' '}
                  </>
                ) : null}
              </Trans>
              stkAAVE
            </Typography>{' '}
            <Trans>
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
          </Trans>
        </Typography>
      );

    return (
      <Alert
        icon={<InfoIcon sx={{ color: (theme) => theme.palette.primary.main }} />}
        severity="info"
        sx={{
          background: palette.background.surface2,
          visibility: alertText ? 'visible' : 'hidden',
          minHeight: downToXsm ? 'unset' : '54px',
        }}
      >
        {alertText}
      </Alert>
    );
  };

  const GhoDiscountCalculatorDesktop = (
    <Stack direction="row" gap={8}>
      <Box>
        <GhoPieChartContainer
          borrowAmount={ghoBorrow}
          discountableAmount={discountableGhoAmount}
          baseRate={rateSelection.baseRate}
          discountedAmountRate={rateSelection.rateAfterMaxDiscount}
          rateAfterDiscount={rateSelection.rateAfterDiscount}
        />
      </Box>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        sx={{ width: '258px' }}
      >
        <Box>
          <CalculatorInput
            title="Borrow amount"
            value={ghoBorrow}
            disabled={ghoLoadingData}
            tokenSymbol="GHO"
            onValueChanged={(value) => setGhoBorrow(value)}
            sliderMax={100000}
            sliderMin={1}
          />
        </Box>
        <Box>
          <CalculatorInput
            title="Staked AAVE amount"
            value={stkAave}
            disabled={ghoLoadingData}
            tokenSymbol="stkAAVE"
            onValueChanged={(value) => setStkAave(value)}
            sliderMax={1000}
          />
        </Box>
        <StakingDiscountAlert />
      </Stack>
    </Stack>
  );

  const GhoDiscountCalculatorMobile = (
    <>
      <GhoPieChartContainer
        borrowAmount={ghoBorrow}
        discountableAmount={discountableGhoAmount}
        baseRate={rateSelection.baseRate}
        discountedAmountRate={rateSelection.rateAfterMaxDiscount}
        rateAfterDiscount={rateSelection.rateAfterDiscount}
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
            sliderMin={1}
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
          />
        </Box>
        <StakingDiscountAlert />
      </Stack>
    </>
  );

  return (
    <>
      <Typography variant="subheader1" gutterBottom>
        <Trans>Staking discount</Trans>
      </Typography>
      <Typography variant="caption" color="text.secondary" mb={6}>
        <Trans>
          Users who stake AAVE in Safety Module (i.e. stkAAVE holders) receive a discount on GHO
          borrow interest rate. The discount applies to 100 GHO for every 1 stkAAVE held. Use the
          calculator below to see GHO borrow rate with the discount applied.
        </Trans>
      </Typography>
      {downToXsm ? GhoDiscountCalculatorMobile : GhoDiscountCalculatorDesktop}
      <Box sx={{ mt: downToXsm ? 4 : 10 }}>
        <GhoDiscountParametersComponent loading={ghoLoadingData} />
      </Box>
    </>
  );
};
