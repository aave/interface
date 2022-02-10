import { Trans } from '@lingui/macro';
import { Paper, Box, Stack, Button, Typography, PaperProps } from '@mui/material';
import { BoxProps } from '@mui/system';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TopInfoPanelItem } from 'src/components/TopInfoPanel/TopInfoPanelItem';
import { StakeGeneralData, StakeUserData } from 'src/hooks/stake-data-provider/graphql/hooks';

export interface StakingPanelProps extends PaperProps {
  onStakeAction?: () => void;
  onClaimAction?: () => void;
  onCooldownAction?: () => void;
  stakeData?: StakeGeneralData;
  stakeUserData?: StakeUserData;
  description?: React.ReactNode;
  stakeTitle: string;
  stakedToken: string;
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

const StakeDetails: React.FC<PaperProps> = ({ sx, ...props }) => (
  <Paper
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 2,
      py: 5,
      px: 4,
      mt: 8,
      ...sx,
    }}
    {...props}
  />
);

const ActionDetails: React.FC<BoxProps> = ({ sx, ...props }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      mt: 3,
      ...sx,
    }}
    {...props}
  />
);

export const StakingPanel: React.FC<StakingPanelProps> = ({
  onStakeAction,
  onClaimAction,
  onCooldownAction,
  stakeTitle,
  stakedToken,
  description,
  icon,
  sx,
  stakeData,
  stakeUserData,
  ...props
}) => {
  return (
    <Paper sx={{ width: '100%', py: 4, px: 6, ...sx }} {...props}>
      <Typography variant="h3">
        <Trans>Stake</Trans> {stakeTitle}
      </Typography>

      <StakeDetails>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TokenIcon symbol={icon} fontSize="large" />
          {stakedToken}
        </Box>
        <TopInfoPanelItem title={<Trans>Staking APR</Trans>} hideIcon variant="light">
          <FormattedNumber
            value={parseFloat(stakeData?.stakeApy || '0') / 10000}
            percent
            variant="main16"
          />
        </TopInfoPanelItem>

        <TopInfoPanelItem title={<Trans>Max slashing</Trans>} hideIcon variant="light">
          <FormattedNumber value={'0.3'} percent variant="main16" />
        </TopInfoPanelItem>

        {/**Stake action */}
        <Button variant="contained" size="medium" sx={{ width: '96px' }} onClick={onStakeAction}>
          <Trans>Stake</Trans>
        </Button>
      </StakeDetails>

      <Stack spacing={4} direction="row" sx={{ mt: 4 }}>
        {/** Cooldown action */}
        <StakeActionPaper>
          <Typography variant="description" color="text.secondary">
            <Trans>Staked</Trans> {stakedToken}
          </Typography>
          <FormattedNumber
            value={stakeUserData?.stakeTokenUserBalance || 0}
            sx={{ fontSize: '21px !important', fontWeight: 500 }}
            minimumDecimals={2}
          />
          <FormattedNumber value={'1000'} symbol="USD" minimumDecimals={2} maximumDecimals={2} />
          <Button variant="surface" sx={{ mt: 6, width: '100%' }} onClick={onCooldownAction}>
            <Trans>Cooldown to unstake</Trans>
          </Button>
          <ActionDetails>
            <Typography color="text.secondary">
              <Trans>Cooldown period</Trans>
            </Typography>
            <Typography color="text.primary" fontWeight={500}>
              <Trans>10 days</Trans>
            </Typography>
          </ActionDetails>
        </StakeActionPaper>

        {/** Stake action */}
        <StakeActionPaper>
          <Typography variant="description" color="text.secondary">
            <Trans>Claimable AAVE</Trans>
          </Typography>
          <FormattedNumber
            value={stakeUserData?.userIncentivesToClaim || 0}
            sx={{ fontSize: '21px !important', fontWeight: 500 }}
            minimumDecimals={2}
          />
          <FormattedNumber value={'1000'} symbol="USD" minimumDecimals={2} maximumDecimals={2} />
          <Button variant="contained" sx={{ mt: 6, width: '100%' }} onClick={onClaimAction}>
            <Trans>Claim AAVE</Trans>
          </Button>
          <ActionDetails>
            <Typography color="text.secondary">
              <Trans>Aave per month</Trans>
            </Typography>
            <FormattedNumber value={'100'} sx={{ fontWeight: 500 }} minimumDecimals={2} />
          </ActionDetails>
        </StakeActionPaper>
      </Stack>
      {!!description && description}
    </Paper>
  );
};
