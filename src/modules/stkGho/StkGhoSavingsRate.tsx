import { Trans } from '@lingui/macro';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

interface StkGhoSavingsRateProps {
  totalDepositedUSD: string;
}

export const StkGhoSavingsRate = ({ totalDepositedUSD }: StkGhoSavingsRateProps) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));

  const stakeApyDecimal = 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subheader1" sx={{ mb: 4 }}>
        <Trans>stkGHO Savings Rate</Trans>
      </Typography>

      <Stack
        divider={<Divider orientation={xsm ? 'vertical' : 'horizontal'} flexItem />}
        direction={{ xs: 'column', xsm: 'row' }}
        spacing={{ xs: 2, xsm: 8 }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            <Trans>Total Deposited</Trans>
          </Typography>
          <FormattedNumber
            value={totalDepositedUSD}
            variant="main16"
            symbol="USD"
            visibleDecimals={2}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            <Trans>APY</Trans>
          </Typography>
          <FormattedNumber value={stakeApyDecimal} percent variant="main16" />
        </Box>
      </Stack>
    </Box>
  );
};
