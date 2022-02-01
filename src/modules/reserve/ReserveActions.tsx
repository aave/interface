import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, Paper, Stack, StackProps, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

const ReserveRow: React.FC<StackProps> = (props) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ mb: '24px' }}
    {...props}
  />
);

export const ReserveActions = () => (
  <>
    {/** Supply panel */}
    <Paper sx={{ minHeight: '237px', py: '16px', px: '24px' }}>
      <Typography variant="h3" sx={{ mb: '40px' }}>
        <Trans>Your supplies</Trans>
      </Typography>

      <ReserveRow>
        <Typography>
          <Trans>Supply balance</Trans>
        </Typography>
        <FormattedNumber value="10" />
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
    <Paper sx={{ mt: 4, minHeight: '237px', py: '16px', px: '24px' }}>
      <Typography variant="h3" sx={{ mb: '40px' }}>
        <Trans>Your borrows</Trans>
      </Typography>

      <ReserveRow>
        <Trans>Borrow balance</Trans>
        <FormattedNumber value="10" />
      </ReserveRow>

      <ReserveRow>
        <Trans component={Typography}>Available to borrow</Trans>
        <FormattedNumber value="10" />
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
