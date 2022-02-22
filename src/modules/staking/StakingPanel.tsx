import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
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
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));

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

  const stakeUnstakeWindowCountdown = isUnstakeWindowActive
    ? getTimeRemaining(stakeUnstakeWindow - userCooldownDelta)
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
    <Paper sx={{ p: { xs: 4, xsm: 6 }, pt: 4, height: '100%' }}>
      <Typography variant="h3" mb={8} sx={{ display: { xs: 'none', xsm: 'block' } }}>
        <Trans>Stake</Trans> {stakeTitle}
      </Typography>

      <Box
        sx={(theme) => ({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', xsm: 'center' },
          flexDirection: { xs: 'column', xsm: 'row' },
          gap: { xs: 0, xsm: 2 },
          borderRadius: { xs: 0, xsm: '6px' },
          border: { xs: 'unset', xsm: `1px solid ${theme.palette.divider}` },
          p: { xs: 0, xsm: 4 },
          background: {
            xs: 'unset',
            xsm:
              theme.palette.mode === 'light'
                ? theme.palette.background.paper
                : theme.palette.background.surface,
          },
          position: 'relative',
          '&:after': {
            content: "''",
            position: 'absolute',
            bottom: 0,
            left: '-16px',
            width: 'calc(100% + 32px)',
            height: '1px',
            bgcolor: { xs: 'divider', xsm: 'transparent' },
          },
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 4, xsm: 0 } }}>
          <TokenIcon symbol={icon} sx={{ fontSize: { xs: '40px', xsm: '32px' } }} />
          <Typography variant={xsm ? 'subheader1' : 'h4'} ml={2}>
            {stakedToken}
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: 'flex', xsm: 'block' },
            width: { xs: '100%', xsm: 'unset' },
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 4, xsm: 0 },
          }}
        >
          <Typography
            variant={xsm ? 'subheader2' : 'description'}
            color={xsm ? 'text.secondary' : 'text.primary'}
          >
            <Trans>Staking APR</Trans>
          </Typography>
          <FormattedNumber
            value={parseFloat(stakeData?.stakeApy || '0') / 10000}
            percent
            variant="secondary14"
          />
        </Box>

        <Box
          sx={{
            display: { xs: 'flex', xsm: 'block' },
            width: { xs: '100%', xsm: 'unset' },
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 4, xsm: 0 },
          }}
        >
          <Typography
            variant={xsm ? 'subheader2' : 'description'}
            color={xsm ? 'text.secondary' : 'text.primary'}
          >
            <Trans>Max slashing</Trans>
          </Typography>
          <FormattedNumber value={maxSlash} percent variant="secondary14" />
        </Box>

        {/**Stake action */}
        <Button
          variant="contained"
          sx={{ minWidth: '96px', mb: { xs: 6, xsm: 0 } }}
          onClick={onStakeAction}
          disabled={stakeUserData?.stakeTokenUserBalance === '0'}
          fullWidth={!xsm}
        >
          <Trans>Stake</Trans>
        </Button>
      </Box>

      <Stack spacing={4} direction={{ xs: 'column', xsm: 'row' }} sx={{ mt: 4 }}>
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
            <TextWithTooltip
              text={
                isCooldownActive && !isUnstakeWindowActive ? (
                  <Trans>Cooldown time left</Trans>
                ) : isUnstakeWindowActive ? (
                  <Trans>Time left to unstake</Trans>
                ) : (
                  <Trans>Cooldown period</Trans>
                )
              }
            >
              <>
                {isCooldownActive && !isUnstakeWindowActive ? (
                  <Trans>Time left to be able to withdraw your staked asset.</Trans>
                ) : isUnstakeWindowActive ? (
                  <Trans>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis, quia?
                  </Trans>
                ) : (
                  <Trans>
                    You can only withdraw your assets from the Security Module after the cooldown
                    period ends and the unstake window is active.
                  </Trans>
                )}
              </>
            </TextWithTooltip>
          }
          bottomLineComponent={
            <>
              {isCooldownActive && !isUnstakeWindowActive ? (
                <Typography variant="secondary14" sx={{ display: 'inline-flex', gap: 1 }}>
                  {!!cooldownCountdown.days && <span>{cooldownCountdown.days}d</span>}
                  {!!cooldownCountdown.hours && <span>{cooldownCountdown.hours}h</span>}
                  {!!cooldownCountdown.minutes && <span>{cooldownCountdown.minutes}m</span>}
                  {!cooldownCountdown.hours && !!cooldownCountdown.seconds && (
                    <span>{cooldownCountdown.seconds}s</span>
                  )}
                </Typography>
              ) : isUnstakeWindowActive ? (
                <Typography variant="secondary14" sx={{ display: 'inline-flex', gap: 1 }}>
                  {!!stakeUnstakeWindowCountdown.days && (
                    <span>{stakeUnstakeWindowCountdown.days}d</span>
                  )}
                  {!!stakeUnstakeWindowCountdown.hours && (
                    <span>{stakeUnstakeWindowCountdown.hours}h</span>
                  )}
                  {!!stakeUnstakeWindowCountdown.minutes && (
                    <span>{stakeUnstakeWindowCountdown.minutes}m</span>
                  )}
                  {!stakeUnstakeWindowCountdown.hours && !!stakeUnstakeWindowCountdown.seconds && (
                    <span>{stakeUnstakeWindowCountdown.seconds}s</span>
                  )}
                </Typography>
              ) : (
                <Typography variant="secondary14">
                  <Trans>{cooldownDays > 1 ? cooldownDays : '<1'} days</Trans>
                </Typography>
              )}
            </>
          }
          gradientBorder={isUnstakeWindowActive}
        >
          {isUnstakeWindowActive && (
            <Button variant="gradient" fullWidth onClick={onUnstakeAction}>
              <Trans>Unstake now</Trans>
            </Button>
          )}

          {isCooldownActive && !isUnstakeWindowActive && (
            <Button variant="outlined" fullWidth disabled>
              <Trans>Cooling down...</Trans>
            </Button>
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
