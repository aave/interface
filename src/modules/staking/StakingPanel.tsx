import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Paper, Box, Stack, Button, Typography, PaperProps, Tooltip } from '@mui/material';
import { BoxProps } from '@mui/system';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TopInfoPanelItem } from 'src/components/TopInfoPanel/TopInfoPanelItem';
import { StakeGeneralData, StakeUserData } from 'src/hooks/stake-data-provider/graphql/hooks';

export interface StakingPanelProps extends PaperProps {
  onStakeAction?: () => void;
  onStakeRewardClaimAction?: () => void;
  onCooldownAction?: () => void;
  onUnstakeAction?: () => void;
  stakeData?: StakeGeneralData;
  stakeUserData?: StakeUserData;
  description?: React.ReactNode;
  ethUsdPrice?: string;
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

function getTimeRemaining(endtime: number) {
  if (endtime == 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(endtime / (60 * 60 * 24)),
    hours = Math.floor((endtime % (60 * 60 * 24)) / (60 * 60)),
    minutes = Math.floor((endtime % (60 * 60)) / 60),
    seconds = Math.floor(endtime % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export const StakingPanel: React.FC<StakingPanelProps> = ({
  onStakeAction,
  onStakeRewardClaimAction,
  onCooldownAction,
  onUnstakeAction,
  stakeTitle,
  stakedToken,
  description,
  icon,
  sx,
  stakeData,
  stakeUserData,
  ethUsdPrice,
  maxSlash,
  ...props
}) => {
  // Cooldown logic
  const now = Date.now() / 1000;
  const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0;
  const userCooldown = stakeUserData?.userCooldown || 0;
  const stakeUnstakeWindow = stakeData?.stakeUnstakeWindow || 0;

  const userCooldownDelta = now - userCooldown;
  const isCooldownActive = userCooldownDelta < stakeCooldownSeconds + stakeUnstakeWindow;
  const isUnstakeWindowActive =
    isCooldownActive &&
    userCooldownDelta > stakeCooldownSeconds &&
    userCooldownDelta < stakeUnstakeWindow;

  const cooldownDays = stakeCooldownSeconds ? stakeCooldownSeconds / 86400 : 10;
  const cooldownCountdown =
    isCooldownActive && !isUnstakeWindowActive
      ? getTimeRemaining(stakeCooldownSeconds - userCooldownDelta)
      : getTimeRemaining(0);
  // Others
  const stakedUSD = formatEther(
    BigNumber.from(stakeUserData?.stakeTokenUserBalance || '0')
      .mul(stakeData?.stakeTokenPriceEth || '0')
      .div(ethUsdPrice || '1')
  );
  const claimableUSD = formatEther(
    BigNumber.from(stakeUserData?.userIncentivesToClaim || '0')
      .mul(stakeData?.rewardTokenPriceEth || '0')
      .div(ethUsdPrice || '1')
  );
  const aavePerMonth = formatEther(
    valueToBigNumber(stakeUserData?.stakeTokenUserBalance || '0')
      .dividedBy(stakeData?.stakeTokenTotalSupply || '1')
      .multipliedBy(stakeData?.distributionPerSecond || '0')
      .multipliedBy('2592000')
      .toFixed(0)
  );


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
          <FormattedNumber value={maxSlash} percent variant="main16" />
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
            value={formatEther(stakeUserData?.stakeTokenUserBalance || '0')}
            sx={{ fontSize: '21px !important', fontWeight: 500 }}
            visibleDecimals={2}
          />
          <FormattedNumber value={stakedUSD} symbol="USD" visibleDecimals={2} />
          {isUnstakeWindowActive && (
            <Button variant="outlined" sx={{ mt: 6, width: '100%' }} onClick={onUnstakeAction}>
              <Trans>Unstake now</Trans>
            </Button>
          )}
          {isCooldownActive && !isUnstakeWindowActive && (
            // eslint-disable-next-line react/jsx-no-undef
            <Tooltip
              title={() => <Trans>Time left to be able to withdraw your staked asset.</Trans>}
            >
              <Button
                variant="outlined"
                sx={{ mt: 6, width: '100%', display: 'flex', gap: 1 }}
                disabled
              >
                {!!cooldownCountdown.days && (
                  <Typography>
                    <Trans>{cooldownCountdown.days} days</Trans>
                  </Typography>
                )}
                {!!cooldownCountdown.hours && (
                  <Typography>
                    <Trans>{cooldownCountdown.hours} hours</Trans>
                  </Typography>
                )}
                {!!cooldownCountdown.minutes && (
                  <Typography>
                    <Trans>{cooldownCountdown.minutes} minutes</Trans>
                  </Typography>
                )}
                {!!!cooldownCountdown.hours && !!cooldownCountdown.seconds && (
                  <Typography>
                    <Trans>{cooldownCountdown.seconds} seconds</Trans>
                  </Typography>
                )}
                <Typography>
                  <Trans>left</Trans>
                </Typography>
              </Button>
            </Tooltip>
          )}

          {!isCooldownActive && (
            <Button variant="outlined" sx={{ mt: 6, width: '100%' }} onClick={onCooldownAction}>
              <Trans>Cooldown to unstake</Trans>
            </Button>
          )}

          <ActionDetails>
            <Typography color="text.secondary">
              <Trans>Cooldown period</Trans>
            </Typography>
            <Typography color="text.primary" fontWeight={500}>
              <Trans>{cooldownDays > 1 ? cooldownDays : '<1'} days</Trans>
            </Typography>
          </ActionDetails>
        </StakeActionPaper>

        {/** Stake action */}
        <StakeActionPaper>
          <Typography variant="description" color="text.secondary">
            <Trans>Claimable AAVE</Trans>
          </Typography>
          <FormattedNumber
            value={formatEther(stakeUserData?.userIncentivesToClaim || '0')}
            sx={{ fontSize: '21px !important', fontWeight: 500 }}
            visibleDecimals={2}
          />
          <FormattedNumber value={claimableUSD} symbol="USD" visibleDecimals={2} />
          <Button
            variant="contained"
            sx={{ mt: 6, width: '100%' }}
            onClick={onStakeRewardClaimAction}
          >
            <Trans>Claim AAVE</Trans>
          </Button>
          <ActionDetails>
            <Typography color="text.secondary">
              <Trans>Aave per month</Trans>
            </Typography>
            <FormattedNumber value={aavePerMonth} sx={{ fontWeight: 500 }} visibleDecimals={2} />
          </ActionDetails>
        </StakeActionPaper>
      </Stack>
      {!!description && description}
    </Paper>
  );
};
