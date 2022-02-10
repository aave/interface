import { Trans } from '@lingui/macro';
import { Paper, Box, Stack, Button, Typography, PaperProps } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TopInfoPanelItem } from 'src/components/TopInfoPanel/TopInfoPanelItem';

export interface StakingPanelProps extends PaperProps {
  onStakeAction?: () => void;
  description?: React.ReactNode;
  stakeTitle: string;
  stakedToken: string;
  apr: string;
  maxSlash: string;
  icon: string;
}

const StakeActionPaper: React.FC<PaperProps> = ({ sx, ...props }) => (
  <Paper
    sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      p: 4,
      ...sx,
    }}
    {...props}
  />
);

export const StakingPanel: React.FC<StakingPanelProps> = ({
  onStakeAction,
  stakeTitle,
  stakedToken,
  description,
  icon,
  sx,
  ...props
}) => {
  return (
    <Paper sx={{ width: '100%', py: 4, px: 6, ...sx }} {...props}>
      <Typography variant="h3">
        <Trans>Stake</Trans> {stakeTitle}
      </Typography>
      <Paper
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          py: 5,
          px: 4,
          mt: 8,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TokenIcon symbol={icon} fontSize="large" />
          {stakedToken}
        </Box>
        <TopInfoPanelItem title={<Trans>Staking APR</Trans>} hideIcon variant="light">
          <FormattedNumber value={'1'} percent variant="main16" />
        </TopInfoPanelItem>
        <TopInfoPanelItem title={<Trans>Max slashing</Trans>} hideIcon variant="light">
          <FormattedNumber value={'0.3'} percent variant="main16" />
        </TopInfoPanelItem>
        <Button variant="contained" size="medium" sx={{ width: '96px' }}>
          <Trans>Stake</Trans>
        </Button>
      </Paper>
      <Stack spacing={4} direction="row" sx={{ mt: 4 }}>
        {/** Cooldown action */}
        <StakeActionPaper>
          <Typography variant="description" color="text.secondary">
            <Trans>Staked</Trans> {stakedToken}
          </Typography>
          <FormattedNumber
            value={'100'}
            sx={{ fontSize: '21px !important', fontWeight: 500 }}
            minimumDecimals={2}
          />
          <FormattedNumber value={'1000'} symbol="USD" minimumDecimals={2} maximumDecimals={2} />
          <Button variant="surface" sx={{ mt: 6, width: '100%' }}>
            <Trans>Cooldown to unstake</Trans>
          </Button>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              mt: 3,
            }}
          >
            <Typography color="text.secondary">
              <Trans>Cooldown period</Trans>
            </Typography>
            <Typography color="text.primary" fontWeight={500}>
              <Trans>10 days</Trans>
            </Typography>
          </Box>
        </StakeActionPaper>

        {/** Stake action */}
        <StakeActionPaper>
          <Typography variant="description" color="text.secondary">
            <Trans>Claimable AAVE</Trans>
          </Typography>
          <FormattedNumber
            value={'100'}
            sx={{ fontSize: '21px !important', fontWeight: 500 }}
            minimumDecimals={2}
          />
          <FormattedNumber value={'1000'} symbol="USD" minimumDecimals={2} maximumDecimals={2} />
          <Button variant="contained" sx={{ mt: 6, width: '100%' }}>
            <Trans>Claim AAVE</Trans>
          </Button>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              mt: 3,
            }}
          >
            <Typography color="text.secondary">
              <Trans>Aave per month</Trans>
            </Typography>
            <FormattedNumber value={'100'} sx={{ fontWeight: 500 }} minimumDecimals={2} />
          </Box>
        </StakeActionPaper>
      </Stack>
      {!!description && description}
    </Paper>
  );
};
