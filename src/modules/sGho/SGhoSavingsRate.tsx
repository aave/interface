import { Trans } from '@lingui/macro';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { convertAprToApy } from 'src/utils/utils';

interface SGhoSavingsRateProps {
  totalDepositedUSD: string;
  rate: number;
}

export const SGhoSavingsRate = ({ totalDepositedUSD, rate }: SGhoSavingsRateProps) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));

  const apy = convertAprToApy(rate);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subheader1" sx={{ mb: 4 }}>
        <Trans>Savings Rate</Trans>
      </Typography>

      <Stack
        divider={<Divider orientation={xsm ? 'vertical' : 'horizontal'} flexItem />}
        direction={{ xs: 'column', xsm: 'row' }}
        spacing={{ xs: 2, xsm: 8 }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="caption" color="fg-2">
            <Trans>Total Deposited</Trans>
          </Typography>
          <FormattedNumber
            value={totalDepositedUSD}
            variant="h4"
            symbol="USD"
            visibleDecimals={2}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="fg-2">
            <Trans>APR</Trans>
          </Typography>
          <FormattedNumber value={rate} percent variant="h4" visibleDecimals={2} />
        </Box>

        <Box>
          <Typography variant="caption" color="fg-2">
            <Trans>APY, fixed rate</Trans>
          </Typography>
          <FormattedNumber value={apy} percent variant="h4" visibleDecimals={2} />
        </Box>
      </Stack>
    </Box>
  );
};
