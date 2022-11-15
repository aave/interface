import { normalizeBN } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import {
  Alert,
  Box,
  FilledInput,
  Grid,
  Paper,
  Slider,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useRootStore } from 'src/store/root';

type GhoDiscountCalculatorProps = {
  baseVariableBorrowRate: string;
};

type GhoMetaHeaderProps = {
  title: ReactNode;
  value: ReactNode | string;
};

const GhoMetaHeader: React.FC<GhoMetaHeaderProps> = ({ title, value }) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={{
        position: 'relative',
        '&:not(:last-child)': {
          pr: 4,
          mr: 4,
        },
        ...(mdUp
          ? {
              '&:not(:last-child):not(.borderless)::after': {
                content: '""',
                height: '32px',
                position: 'absolute',
                right: 4,
                top: 'calc(50% - 17px)',
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }
          : {}),
      }}
    >
      <Typography variant="subheader2" color="text.secondary">
        {title}
      </Typography>
      {value}
    </Box>
  );
};

export const GhoDiscountCalculator = ({ baseVariableBorrowRate }: GhoDiscountCalculatorProps) => {
  const [stkAave, setStkAave] = useState<number>(0);
  const [ghoBorrow, setGhoBorrow] = useState<number>(0);
  const [calculatedDiscountRate, setCalculatedDiscountRate] = useState<number>(0);
  const [calculatedBorrowAPY, setCalculatedBorrowAPY] = useState<number>(0);
  const [discountableGhoAmount, setDiscountableGhoAmount] = useState<number>(0);
  const {
    ghoDiscountRatePercent,
    ghoDiscountedPerToken,
    ghoMinDebtTokenBalanceForEligibleDiscount,
    ghoMinDiscountTokenBalanceForEligibleDiscount,
  } = useRootStore();

  // TODO: we need a better way to normalize these values. Maybe we just do it in the store? I'm not sure
  // if we'd need these values NOT normalized. If not, it would just make sense to do the conversion when we fetch it from utils.
  const baseBorrowRate = normalizeBN(baseVariableBorrowRate, 27).toNumber(); // 0.02 or 2%
  const minStkAave = normalizeBN(
    ghoMinDiscountTokenBalanceForEligibleDiscount.toString(),
    18
  ).toNumber();
  const minGhoBorrowed = normalizeBN(
    ghoMinDebtTokenBalanceForEligibleDiscount.toString(),
    18
  ).toNumber();
  const discountedPerToken = Number(ghoDiscountedPerToken);

  /**
   * This function recreates the logic that happens in GhoDiscountRateStrategy.sol to determine a user's discount rate for borrowing GHO based off of the amount of stkAAVE a user holds.
   * This is repeated here so that we don't bombard the RPC with HTTP requests to do this calculation and read from on-chain logic.
   * NOTE: if the discount rate strategy changes on-chain, then this creates a maintenance issue and we'll have to update this.
   * @param stakedAave - The hypothectical amount of stkAAVE
   * @param borrowedGho - The hypothetical amount of GHO
   */
  const calculateDiscountRate = async (stakedAave: number, borrowedGho: number) => {
    let newRate: number;

    // Calculate
    if (stakedAave < minStkAave || borrowedGho < minGhoBorrowed) {
      newRate = 0;
    } else {
      const discountableAmount = stakedAave * discountedPerToken;
      if (discountableAmount >= borrowedGho) {
        newRate = ghoDiscountRatePercent;
      } else {
        newRate = (discountableAmount * ghoDiscountRatePercent) / borrowedGho;
      }
      setDiscountableGhoAmount(discountableAmount);
    }

    // Calculate the new borrow APY - Takes the total discount as a fraction of the existing borrow rate
    const newBorrowAPY = baseBorrowRate - baseBorrowRate * newRate;

    // Update local state
    setCalculatedDiscountRate(newRate);
    setCalculatedBorrowAPY(newBorrowAPY);
  };

  useEffect(() => {
    calculateDiscountRate(stkAave, ghoBorrow);
  }, [stkAave, ghoBorrow]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <>
      <Alert severity="info">
        <Trans>
          Safety Module participants receive a discount on the GHO borrow interest rate.
        </Trans>{' '}
        <Link href="" underline="always">
          <Trans>Learn more</Trans>
        </Link>
      </Alert>
      <Box
        sx={{
          mt: 3,
          mb: 10,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <GhoMetaHeader
          title={<Trans>Discount on borrow APY</Trans>}
          value={
            <>
              <FormattedNumber
                value={calculatedDiscountRate}
                percent
                variant="main16"
                sx={{ mr: 1 }}
              />
              <Typography component="span" variant="secondary16" color="text.secondary">
                <Trans>off</Trans>
              </Typography>
            </>
          }
        />
        <GhoMetaHeader
          title={<Trans>APY with max discount</Trans>}
          value={<FormattedNumber value={0.016} percent variant="main16" />}
        />
        <GhoMetaHeader
          title={<Trans>Discountable amount</Trans>}
          value={
            <Typography variant="main16" display="flex" alignItems="center">
              <TokenIcon symbol="GHO" sx={{ fontSize: '16px', mr: 1 }} />
              100
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
          }
        />
      </Box>
      <Paper>
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
                <Trans>You stake</Trans> (stkAAVE)
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
                <Trans>You borrow</Trans> (GHO)
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
                  GHO <Trans>borrow APY</Trans>
                </Typography>
              </Box>
              <Box>
                <Box
                  mb={3}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      border: '2px solid #B6519F',
                      borderRadius: '50%',
                      mr: 3,
                    }}
                  />
                  <Box flexGrow={1}>
                    <Typography>
                      <Trans>Discountable amount</Trans>
                    </Typography>
                    <Typography variant="secondary12" color="text.secondary">
                      <Trans>APY with discount</Trans>
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Box display="flex" alignItems="center">
                      <TokenIcon symbol="GHO" fontSize="small" sx={{ mr: 1 }} />
                      <FormattedNumber
                        value={
                          discountableGhoAmount >= ghoBorrow ? ghoBorrow : discountableGhoAmount
                        }
                        visibleDecimals={0}
                      />
                    </Box>
                    <FormattedNumber value={calculatedBorrowAPY} percent />
                  </Box>
                </Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      border: '2px solid #2EBAC6',
                      borderRadius: '50%',
                      mr: 3,
                    }}
                  />
                  <Box flexGrow={1}>
                    <Typography>
                      <Trans>Non-discountable amount</Trans>
                    </Typography>
                    <Typography variant="secondary12" color="text.secondary">
                      <Trans>APY without discount</Trans>
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Box display="flex" alignItems="center">
                      <TokenIcon symbol="GHO" fontSize="small" sx={{ mr: 1 }} />
                      <FormattedNumber
                        value={
                          discountableGhoAmount >= ghoBorrow ? 0 : ghoBorrow - discountableGhoAmount
                        }
                        visibleDecimals={0}
                      />
                    </Box>
                    <FormattedNumber value={baseBorrowRate} percent />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
