import { Trans } from '@lingui/macro';
import {
  Box,
  FilledInput,
  Grid,
  Paper,
  Slider,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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

type GhoAmountDisplayComponentProps = {
  isDiscountableAmount: boolean;
  value: number;
  rate: number;
};

const GhoAmountDisplayComponent = ({
  isDiscountableAmount,
  value,
  rate,
}: GhoAmountDisplayComponentProps): JSX.Element => (
  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
    <Box
      sx={{
        width: 10,
        height: 10,
        border: isDiscountableAmount ? '2px solid #B6519F' : '2px solid #2EBAC6',
        borderRadius: '50%',
        mr: 3,
      }}
    />
    <Box flexGrow={1}>
      <Typography>
        {isDiscountableAmount ? (
          <Trans>Discountable amount</Trans>
        ) : (
          <Trans>Non-discountable amount</Trans>
        )}
      </Typography>
      <Typography variant="secondary12" color="text.secondary">
        {isDiscountableAmount ? (
          <Trans>APY with discount</Trans>
        ) : (
          <Trans>APY without discount</Trans>
        )}
      </Typography>
    </Box>
    <Box textAlign="right">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <TokenIcon symbol="GHO" fontSize="small" sx={{ mr: 1 }} />
        <FormattedNumber value={value} visibleDecimals={0} />
      </Box>
      <FormattedNumber value={rate} percent />
    </Box>
  </Box>
);

const GhoAmountMobileDisplayComponent = ({
  isDiscountableAmount,
  value,
  rate,
}: GhoAmountDisplayComponentProps): JSX.Element => (
  <Box mb={4} sx={{ '&:last-child': { mb: 0 } }}>
    <Box display="flex" alignItems="center" mb={2}>
      <Box
        sx={{
          width: 10,
          height: 10,
          border: isDiscountableAmount ? '2px solid #B6519F' : '2px solid #2EBAC6',
          borderRadius: '50%',
          mr: 3,
        }}
      />
      <Box flexGrow={1}>
        <Typography>
          {isDiscountableAmount ? (
            <Trans>Discountable amount</Trans>
          ) : (
            <Trans>Non-discountable amount</Trans>
          )}
        </Typography>
        <Typography variant="secondary12" color="text.secondary">
          {isDiscountableAmount ? (
            <Trans>APY with discount</Trans>
          ) : (
            <Trans>APY without discount</Trans>
          )}
        </Typography>
      </Box>
    </Box>
    <Box display="flex" alignItems="center">
      <TokenIcon symbol="GHO" fontSize="small" sx={{ mr: 2 }} />
      <Box display="flex" flexDirection="column">
        <FormattedNumber value={value} visibleDecimals={0} />
        <FormattedNumber value={rate} percent />
      </Box>
    </Box>
  </Box>
);

export const GhoDiscountCalculator = ({ baseVariableBorrowRate }: GhoDiscountCalculatorProps) => {
  const [stkAave, setStkAave] = useState<number>(0);
  const [ghoBorrow, setGhoBorrow] = useState<number>(0);
  const [calculatedBorrowAPY, setCalculatedBorrowAPY] = useState<number>(0);
  const [discountableGhoAmount, setDiscountableGhoAmount] = useState<number>(0);
  const { breakpoints } = useTheme();
  const mobileScreens = useMediaQuery(breakpoints.down('sm'));
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

  return (
    <>
      <Paper sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="subheader2"
          color="info.dark"
          px={4}
          py={2}
          sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Trans>Calculate GHO borrow interest rate with discount</Trans>
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={6} sx={{ backgroundColor: 'background.surface' }}>
            <Box px={6} pt={8} pb={6}>
              <Typography color="text.secondary" gutterBottom>
                <Trans>You stake (stkAAVE)</Trans>
              </Typography>
              <FilledInput
                fullWidth
                value={stkAave}
                endAdornment={<TokenIcon symbol="AAVE" />}
                onChange={(e) => setStkAave(Number(e.target.value))}
                inputProps={{ sx: { py: 2, px: 3, fontSize: '21px' } }}
              />
              <Slider
                size="small"
                value={stkAave}
                sx={{ mt: 1, mb: 4, color: '#CE64B6' }}
                onChange={(_, val) => setStkAave(Number(val))}
                step={5}
                max={1000}
              />
              <Typography color="text.secondary" gutterBottom>
                <Trans>You borrow (GHO)</Trans>
              </Typography>
              <FilledInput
                fullWidth
                value={ghoBorrow}
                endAdornment={<TokenIcon symbol="GHO" />}
                inputProps={{ sx: { py: 2, px: 3, fontSize: '21px' } }}
                onChange={(e) => setGhoBorrow(Number(e.target.value))}
              />
              <Slider
                size="small"
                value={ghoBorrow}
                sx={{ mt: 1, mb: 4, color: '#2EBAC6' }}
                onChange={(_, val) => setGhoBorrow(Number(val))}
                step={1000}
                max={100000}
              />
              <Typography variant="helperText" color="text.secondary" sx={{ mt: 16 }} component="p">
                <Trans>
                  Discount and discountable amount are determined by AaveDao and may be changed over
                  time. Participate in Governance to vote.
                </Trans>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              px={6}
              pt={8}
              pb={6}
              sx={{ height: '100%' }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box mt={12} textAlign="center">
                <FormattedNumber value={calculatedBorrowAPY} percent variant="display1" />
                <Typography variant="caption" color="text.secondary">
                  <Trans>GHO borrow APY</Trans>
                </Typography>
              </Box>
              <Box>
                {mobileScreens ? (
                  <>
                    <GhoAmountMobileDisplayComponent
                      isDiscountableAmount
                      value={displayDiscountableAmount(discountableGhoAmount, ghoBorrow)}
                      rate={borrowAPYWithMaxDiscount}
                    />
                    <GhoAmountMobileDisplayComponent
                      isDiscountableAmount={false}
                      value={displayNonDiscountableAmount(discountableGhoAmount, ghoBorrow)}
                      rate={baseBorrowRate}
                    />
                  </>
                ) : (
                  <>
                    <GhoAmountDisplayComponent
                      isDiscountableAmount
                      value={displayDiscountableAmount(discountableGhoAmount, ghoBorrow)}
                      rate={borrowAPYWithMaxDiscount}
                    />
                    <GhoAmountDisplayComponent
                      isDiscountableAmount={false}
                      value={displayNonDiscountableAmount(discountableGhoAmount, ghoBorrow)}
                      rate={baseBorrowRate}
                    />
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%', py: '40px' }}>
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
            pt: '12px',
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
        <Typography variant="caption" color="text.secondary" paddingTop="24px">
          <Trans>
            All rates and discountables are decided by Aave community and may be changed over time.
            Check Governance for updates and vote.
            <Link
              href=""
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
            >
              Learn more
            </Link>
          </Trans>
        </Typography>
      </Box>
    </>
  );
};
