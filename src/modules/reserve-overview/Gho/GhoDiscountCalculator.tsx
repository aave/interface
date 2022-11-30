import { Trans } from '@lingui/macro';
import { Box, Grid, OutlinedInput, Slider, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { useRootStore } from 'src/store/root';
import {
  displayDiscountableAmount,
  displayNonDiscountableAmount,
  normalizeBaseVariableBorrowRate,
  weightedAverageAPY,
} from 'src/utils/ghoUtilities';

type GhoDiscountCalculatorProps = {
  baseVariableBorrowRate: string;
};

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
  },
};

export const GhoDiscountCalculator = ({ baseVariableBorrowRate }: GhoDiscountCalculatorProps) => {
  const [stkAave, setStkAave] = useState<number>(0);
  const [ghoBorrow, setGhoBorrow] = useState<number>(0);
  const [calculatedBorrowAPY, setCalculatedBorrowAPY] = useState<number>(0);
  const [discountableGhoAmount, setDiscountableGhoAmount] = useState<number>(0);
  const {
    ghoDiscountRatePercent,
    ghoDiscountedPerToken,
    ghoComputed: { borrowAPYWithMaxDiscount },
  } = useRootStore();
  const baseBorrowRate = normalizeBaseVariableBorrowRate(baseVariableBorrowRate);
  const discountedPerToken = Number(ghoDiscountedPerToken);

  /**
   * This function recreates the logic that happens in GhoDiscountRateStrategy.sol to determine a user's discount rate for borrowing GHO based off of the amount of stkAAVE a user holds.
   * This is repeated here so that we don't bombard the RPC with HTTP requests to do this calculation and read from on-chain logic.
   * NOTE: if the discount rate strategy changes on-chain, then this creates a maintenance issue and we'll have to update this.
   * @param stakedAave - The hypothectical amount of stkAAVE
   * @param borrowedGho - The hypothetical amount of GHO
   */
  const calculateDiscountRate = async (stakedAave: number, borrowedGho: number) => {
    const discountableAmount = stakedAave * discountedPerToken;

    // Calculate the new borrow APY
    const newBorrowAPY = weightedAverageAPY(
      baseBorrowRate,
      borrowedGho,
      discountableAmount,
      borrowAPYWithMaxDiscount
    );

    // Update local state
    setDiscountableGhoAmount(discountableAmount);
    setCalculatedBorrowAPY(newBorrowAPY);
  };

  useEffect(() => {
    calculateDiscountRate(stkAave, ghoBorrow);
  }, [stkAave, ghoBorrow]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const GhoDiscountParametersComponent: React.FC = () => (
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
          <Typography variant="main16" display="flex" alignItems="center">
            <TokenIcon symbol="GHO" sx={{ fontSize: '16px', mr: 1 }} />
            {discountedPerToken}
            <Typography
              component="span"
              variant="secondary16"
              color="text.secondary"
              sx={{ mx: 1 }}
            >
              <Trans>to</Trans>
            </Typography>{' '}
            <TokenIcon symbol="AAVE" sx={{ fontSize: '16px', mr: 1 }} />1
          </Typography>
        </ReserveOverviewBox>
        <ReserveOverviewBox title={<Trans>Max discount on borrow rate</Trans>}>
          <FormattedNumber
            value={ghoDiscountRatePercent}
            percent
            variant="main16"
            sx={{ mr: 1 }}
            visibleDecimals={0}
          />
        </ReserveOverviewBox>
        <ReserveOverviewBox title={<Trans>APY with max discount</Trans>}>
          <FormattedNumber value={borrowAPYWithMaxDiscount} percent variant="main16" />
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
        <Grid item xs={6}>
          <Box mb={4}>
            <Typography variant="subheader2" gutterBottom>
              <Trans>Borrow amount</Trans>
            </Typography>
            <OutlinedInput
              fullWidth
              value={ghoBorrow}
              endAdornment={<TokenIcon symbol="GHO" />}
              inputProps={{ sx: { py: 2, px: 3, fontSize: '21px' } }}
              onChange={(e) => setGhoBorrow(Number(e.target.value))}
            />
            <Slider
              size="small"
              value={ghoBorrow}
              onChange={(_, val) => setGhoBorrow(Number(val))}
              step={1000}
              max={100000}
              marks={[
                { value: 0, label: '0' },
                { value: 100000, label: '100,000' },
              ]}
              sx={sliderStyles}
            />
          </Box>
          <Box>
            <Typography variant="subheader2" gutterBottom>
              <Trans>Staked AAVE amount</Trans>
            </Typography>
            <OutlinedInput
              fullWidth
              value={stkAave}
              endAdornment={<TokenIcon symbol="AAVE" />}
              onChange={(e) => setStkAave(Number(e.target.value))}
              inputProps={{ sx: { py: 2, px: 3, fontSize: '21px' } }}
            />
            <Slider
              size="small"
              value={stkAave}
              onChange={(_, val) => setStkAave(Number(val))}
              step={5}
              max={1000}
              marks={[
                { value: 0, label: '0' },
                { value: 1000, label: '1,000' },
              ]}
              sx={sliderStyles}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subheader2" mb={1.5}>
            <Trans>GHO borrow APY</Trans>
          </Typography>
          <FormattedNumber
            value={baseBorrowRate}
            percent
            variant="display1"
            component="div"
            color="text.muted"
            symbolsColor="text.muted"
            mr={1}
            sx={{ textDecoration: 'line-through', '.MuiTypography-root': { ml: 0 } }}
          />
          <FormattedNumber
            value={calculatedBorrowAPY}
            percent
            variant="display1"
            component="div"
            symbolsColor="text.primary"
            sx={{ '.MuiTypography-root': { ml: 0 } }}
          />
        </Grid>
      </Grid>
      <GhoDiscountParametersComponent />
    </>
  );
};
