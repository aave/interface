import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { StakeGeneralUiData, StakeUserUiData } from 'src/store/stakeSlice';

import { TextWithTooltip } from '../../components/TextWithTooltip';
import { GhoDiscountProgram } from './GhoDiscountProgram';
import { StakeActionBox } from './StakeActionBox';

function secondsToDHMS(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return { d, h, m, s };
}

function SecondsToString({ seconds }: { seconds: number }) {
  const { d, h, m, s } = secondsToDHMS(seconds);
  return (
    <>
      {d !== 0 && (
        <span>
          <Trans>{d}d</Trans>
        </span>
      )}
      {h !== 0 && (
        <span>
          <Trans>{h}h</Trans>
        </span>
      )}
      {m !== 0 && (
        <span>
          <Trans>{m}m</Trans>
        </span>
      )}
      {s !== 0 && (
        <span>
          <Trans>{s}s</Trans>
        </span>
      )}
    </>
  );
}

export interface StakingPanelProps {
  onStakeAction?: () => void;
  onStakeRewardClaimAction?: () => void;
  onCooldownAction?: () => void;
  onUnstakeAction?: () => void;
  stakeData?: StakeGeneralUiData['aave'];
  stakeUserData?: StakeUserUiData['aave'];
  headerAction?: React.ReactNode;
  ethUsdPrice?: string;
  stakeTitle: string;
  stakedToken: string;
  maxSlash: string;
  icon: string;
  hasDiscountProgram?: boolean;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({
  onStakeAction,
  onStakeRewardClaimAction,
  onCooldownAction,
  onUnstakeAction,
  stakeTitle,
  stakedToken,
  headerAction,
  icon,
  stakeData,
  stakeUserData,
  ethUsdPrice,
  maxSlash,
  hasDiscountProgram,
}) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));
  const now = useCurrentTimestamp(1);

  // Cooldown logic
  const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0;
  const userCooldown = stakeUserData?.userCooldown || 0;
  const stakeUnstakeWindow = stakeData?.stakeUnstakeWindow || 0;

  const userCooldownDelta = now - userCooldown;
  const isCooldownActive = userCooldownDelta < stakeCooldownSeconds + stakeUnstakeWindow;
  const isUnstakeWindowActive =
    isCooldownActive &&
    userCooldownDelta > stakeCooldownSeconds &&
    userCooldownDelta < stakeUnstakeWindow + stakeCooldownSeconds;

  // Others
  const availableToStake = formatEther(
    BigNumber.from(stakeUserData?.underlyingTokenUserBalance || '0')
  );

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
      <Box
        sx={{
          display: { xs: 'none', xsm: 'flex' },
          alignItems: 'center',
          mb: 8,
        }}
      >
        <Typography variant="h3">
          <Trans>Stake</Trans> {stakeTitle}
        </Typography>
        {headerAction && <Box sx={{ ml: 3 }}>{headerAction}</Box>}
      </Box>

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
            xsm: theme.palette.background.paper,
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
        <Box
          sx={{
            display: 'flex',
            width: { xs: '100%', xsm: 'unset' },
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, xsm: 0 },
          }}
        >
          <TokenIcon symbol={icon} sx={{ fontSize: { xs: '40px', xsm: '32px' } }} />
          <Typography variant={xsm ? 'subheader1' : 'h4'} ml={2}>
            {stakedToken}
          </Typography>
          {headerAction && (
            <Box sx={{ display: { xs: 'block', xsm: 'none' }, textAlign: 'right', flexGrow: 1 }}>
              {headerAction}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: { xs: 'flex', xsm: 'block' },
            width: { xs: '100%', xsm: 'unset' },
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, xsm: 0 },
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
            mb: { xs: 3, xsm: 0 },
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
        <Box
          sx={{
            display: { xs: 'flex', xsm: 'block' },
            width: { xs: '100%', xsm: 'unset' },
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, xsm: 0 },
          }}
        >
          <Typography
            variant={xsm ? 'subheader2' : 'description'}
            color={xsm ? 'text.secondary' : 'text.primary'}
          >
            <Trans>Wallet Balance</Trans>
          </Typography>
          <FormattedNumber value={availableToStake.toString()} />
        </Box>

        {/**Stake action */}
        <Button
          variant="contained"
          sx={{ minWidth: '96px', mb: { xs: 6, xsm: 0 } }}
          onClick={onStakeAction}
          disabled={+availableToStake === 0}
          fullWidth={!xsm}
          data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
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
          dataCy={`stakedBox_${stakedToken}`}
          // TODO: need fix text
          bottomLineTitle={
            <TextWithTooltip
              variant="caption"
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
                  <Trans>Time left until the withdrawal window closes.</Trans>
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
                  <SecondsToString seconds={stakeCooldownSeconds - userCooldownDelta} />
                </Typography>
              ) : isUnstakeWindowActive ? (
                <Typography variant="secondary14" sx={{ display: 'inline-flex', gap: 1 }}>
                  <SecondsToString
                    seconds={stakeUnstakeWindow + stakeCooldownSeconds - userCooldownDelta}
                  />
                </Typography>
              ) : (
                <Typography variant="secondary14">
                  <SecondsToString seconds={stakeCooldownSeconds} />
                </Typography>
              )}
            </>
          }
          gradientBorder={isUnstakeWindowActive}
        >
          {isUnstakeWindowActive && (
            <Button
              variant="gradient"
              fullWidth
              onClick={onUnstakeAction}
              data-cy={`unstakeBtn_${stakedToken}`}
            >
              <Trans>Unstake now</Trans>
            </Button>
          )}

          {isCooldownActive && !isUnstakeWindowActive && (
            <Button
              variant="outlined"
              fullWidth
              disabled
              data-cy={`awaitCoolDownBtn_${stakedToken}`}
            >
              <Trans>Cooling down...</Trans>
            </Button>
          )}

          {!isCooldownActive && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onCooldownAction}
              disabled={stakeUserData?.stakeTokenUserBalance === '0'}
              data-cy={`coolDownBtn_${stakedToken}`}
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
          dataCy={`rewardBox_${stakedToken}`}
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
            data-cy={`claimBtn_${stakedToken}`}
          >
            <Trans>Claim AAVE</Trans>
          </Button>
        </StakeActionBox>
      </Stack>
      {hasDiscountProgram && <GhoDiscountProgram />}
    </Paper>
  );
};
