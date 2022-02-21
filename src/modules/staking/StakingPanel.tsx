import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { StakeGeneralData, StakeUserData } from 'src/hooks/stake-data-provider/graphql/hooks';

import { TextWithTooltip } from '../../components/TextWithTooltip';
import { StakeActionBox } from './StakeActionBox';

export interface StakingPanelProps {
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
  stakeData,
  stakeUserData,
  ethUsdPrice,
  maxSlash,
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
    <Paper sx={{ p: 6, pt: 4, height: '100%' }}>
      <Typography variant="h3" mb={8}>
        <Trans>Stake</Trans> {stakeTitle}
      </Typography>

      <Box
        sx={(theme) => ({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          borderRadius: '6px',
          border: `1px solid ${theme.palette.divider}`,
          p: 4,
          background:
            theme.palette.mode === 'light'
              ? theme.palette.background.paper
              : theme.palette.background.surface,
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon symbol={icon} sx={{ fontSize: '32px' }} />
          <Typography variant="subheader1" ml={2}>
            {stakedToken}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Staking APR</Trans>
          </Typography>
          <FormattedNumber
            value={parseFloat(stakeData?.stakeApy || '0') / 10000}
            percent
            variant="secondary14"
          />
        </Box>

        <Box>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Max slashing</Trans>
          </Typography>
          <FormattedNumber value={maxSlash} percent variant="secondary14" />
        </Box>

        {/**Stake action */}
        <Button
          variant="contained"
          sx={{ minWidth: '96px' }}
          onClick={onStakeAction}
          disabled={stakeUserData?.stakeTokenUserBalance === '0'}
        >
          <Trans>Stake</Trans>
        </Button>
      </Box>

      <Stack spacing={4} direction="row" sx={{ mt: 4 }}>
        {/** Cooldown action */}
        <StakeActionBox
          title={
            <>
              <Trans>Staked</Trans> {stakedToken}
            </>
          }
          value={formatEther(stakeUserData?.stakeTokenUserBalance || '0')}
          valueUSD={stakedUSD}
          // TODO: need fix text
          bottomLineTitle={
            <TextWithTooltip text="Cooldown period">
              <Trans>
                You can only withdraw your assets from the Security Module after the cooldown period
                ends and the unstake window is active.
              </Trans>
            </TextWithTooltip>
          }
          bottomLineComponent={
            <Typography variant="secondary14">
              <Trans>{cooldownDays > 1 ? cooldownDays : '<1'} days</Trans>
            </Typography>
          }
        >
          {isUnstakeWindowActive && (
            <Button variant="outlined" fullWidth onClick={onUnstakeAction}>
              <Trans>Unstake now</Trans>
            </Button>
          )}

          {isCooldownActive && !isUnstakeWindowActive && (
            // eslint-disable-next-line react/jsx-no-undef
            <Tooltip
              title={() => <Trans>Time left to be able to withdraw your staked asset.</Trans>}
            >
              <Button variant="outlined" sx={{ gap: 1 }} fullWidth disabled>
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
            <Button
              variant="outlined"
              fullWidth
              onClick={onCooldownAction}
              disabled={stakeUserData?.stakeTokenUserBalance === '0'}
            >
              <Trans>Cooldown to unstake</Trans>
            </Button>
          )}
        </StakeActionBox>

        <StakeActionBox
          title={<Trans>Claimable AAVE</Trans>}
          value={formatEther(stakeUserData?.userIncentivesToClaim || '0')}
          valueUSD={claimableUSD}
          bottomLineTitle={<Trans>Aave per month</Trans>}
          bottomLineComponent={
            <FormattedNumber
              value={aavePerMonth}
              visibleDecimals={2}
              variant="secondary14"
              color={+aavePerMonth === 0 ? 'text.disabled' : 'text.primary'}
            />
          }
        >
          <Button
            variant="contained"
            onClick={onStakeRewardClaimAction}
            fullWidth
            disabled={stakeUserData?.userIncentivesToClaim === '0'}
          >
            <Trans>Claim AAVE</Trans>
          </Button>
        </StakeActionBox>
      </Stack>

      {!!description && description}
    </Paper>
  );
};
