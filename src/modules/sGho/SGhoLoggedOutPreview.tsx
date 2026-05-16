import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { StakeActionBox } from '../staking/StakeActionBox';

interface SGhoLoggedOutPreviewProps {
  rate: number;
}

/**
 * Marketing preview rendered inside the sGHO card when no wallet is connected.
 * Shows the product's value proposition + the deposit/withdraw structure with
 * placeholder values, so the user can see what they'd be getting before they
 * connect. Actual connect prompt lives in the sidebar.
 */
export const SGhoLoggedOutPreview = ({ rate }: SGhoLoggedOutPreviewProps) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant={xsm ? 'h4' : 'subheader1'} sx={{ mb: 1 }}>
          <Trans>Deposit GHO</Trans>
        </Typography>
        <Typography color="text.secondary">
          <Trans>Deposit GHO and earn up to {(rate * 100).toFixed(2)}% APR</Trans>
        </Typography>
      </Box>

      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: { xs: '8px', xsm: '6px' },
          border: `1px solid ${theme.palette.divider}`,
          p: 4,
          mb: 6,
          background: theme.palette.background.paper,
        })}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            <Trans>Staking APR</Trans>
          </Typography>
          <FormattedNumber value={rate} percent variant="main16" visibleDecimals={2} />
        </Box>
        <Button
          variant="contained"
          disabled
          sx={{ minWidth: '96px', height: '36px' }}
          data-cy="depositBtn_SGHO_loggedOut"
        >
          <Trans>Deposit</Trans>
        </Button>
      </Box>

      <StakeActionBox
        title={<Trans>sGHO</Trans>}
        value="0"
        valueUSD="0"
        dataCy="sghoBalanceBox_loggedOut"
        bottomLineTitle={
          <Typography variant="caption" color="text.secondary">
            <Trans>Cooldown period</Trans>
          </Typography>
        }
        bottomLineComponent={
          <Typography variant="secondary12">
            <Trans>Instant</Trans>
          </Typography>
        }
      >
        <Button variant="outlined" fullWidth disabled data-cy="withdrawBtn_SGHO_loggedOut">
          <Trans>Withdraw</Trans>
        </Button>
      </StakeActionBox>
    </Box>
  );
};
