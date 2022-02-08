import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Stack, StackProps, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { FormattedNumber, FormattedNumberProps } from 'src/components/primitives/FormattedNumber';

const ReserveRow: React.FC<StackProps> = (props) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ mb: '24px' }}
    {...props}
  />
);

interface DoubleFormattedProps extends FormattedNumberProps {
  usdValue: string;
}

const DoubleFormatted: React.FC<DoubleFormattedProps> = ({ usdValue, ...props }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    }}
  >
    <FormattedNumber {...props} />
    <FormattedNumber color="text.muted" symbol="USD" variant="helperText" value={usdValue} />
  </Box>
);

export const ReserveActions = () => (
  <>
    {/** Supply panel */}
    <Paper sx={{ py: '16px', px: '24px' }}>
      <Typography variant="h3" sx={{ mb: '40px' }}>
        <Trans>Your supplies</Trans>
      </Typography>

      <ReserveRow>
        <Typography>
          <Trans>Supply balance</Trans>
        </Typography>
        <DoubleFormatted value="10" usdValue="10" />
      </ReserveRow>

      <ReserveRow>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography>
            <Trans>Available to supply</Trans>
          </Typography>
          <SvgIcon sx={{ fontSize: '18px', color: '#E0E5EA' }}>
            <InformationCircleIcon />
          </SvgIcon>
        </Stack>
        <FormattedNumber value="10" />
      </ReserveRow>

      <Stack direction="row" spacing={2}>
        <Button variant="contained">
          <Trans>Supply</Trans>
        </Button>
        <Button variant="outlined">
          <Trans>Withdraw</Trans>
        </Button>
        <Button variant="outlined">
          <Trans>Swap</Trans>
        </Button>
      </Stack>
    </Paper>

    {/** Borrow panel */}
    <Paper sx={{ mt: 4, py: '16px', px: '24px' }}>
      <Typography variant="h3" sx={{ mb: '40px' }}>
        <Trans>Your borrows</Trans>
      </Typography>

      <ReserveRow>
        <Trans>Borrow balance</Trans>
        <DoubleFormatted value="9" usdValue="9" />
      </ReserveRow>

      <ReserveRow>
        <Trans>Available to borrow</Trans>
        <FormattedNumber value="1" />
      </ReserveRow>

      <Stack direction="row" spacing={2}>
        <Button variant="contained">
          <Trans>Borrow</Trans>
        </Button>
        <Button variant="outlined">
          <Trans>Repay</Trans>
        </Button>
      </Stack>
    </Paper>
  </>
);
