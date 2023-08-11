import {
  GeneralStakeUIDataHumanized,
  GetUserStakeUIDataHumanized,
} from '@aave/contract-helpers/dist/esm/uiStakeDataProvider-contract/types';
import { valueToBigNumber } from '@aave/math-utils';
import { RefreshIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Paper,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import React from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { ENABLE_TESTNET, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

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
  onStakeRewardClaimRestakeAction?: () => void;
  onCooldownAction?: () => void;
  onUnstakeAction?: () => void;
  stakeData?: GeneralStakeUIDataHumanized['aave'];
  stakeUserData?: GetUserStakeUIDataHumanized['aave'];
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  ethPriceUsd?: string;
  stakeTitle: string;
  stakedToken: string;
  maxSlash: string;
  icon: string;
  hasDiscountProgram?: boolean;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({
  onStakeAction,
  onStakeRewardClaimAction,
  onStakeRewardClaimRestakeAction,
  onCooldownAction,
  onUnstakeAction,
  stakeTitle,
  stakedToken,
  description,
  headerAction,
  icon,
  stakeData,
  stakeUserData,
  ethPriceUsd,
  maxSlash,
  hasDiscountProgram,
}) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));
  const now = useCurrentTimestamp(1);

  // Cooldown logic
  const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0;
  const userCooldown = stakeUserData?.userCooldownTimestamp || 0;
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

  const availableToReactivateCooldown =
    isCooldownActive &&
    BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || 0).gt(
      stakeUserData?.userCooldownAmount || 0
    );

  const stakedUSD = formatUnits(
    BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || '0')
      .mul(stakeData?.stakeTokenPriceEth || '0')
      .mul(ethPriceUsd || '1'),
    18 + 18 + 8 // userBalance (18), stakedTokenPriceEth (18), ethPriceUsd (8)
  );

  const claimableUSD = formatUnits(
    BigNumber.from(stakeUserData?.userIncentivesToClaim || '0')
      .mul(stakeData?.rewardTokenPriceEth || '0')
      .mul(ethPriceUsd || '1'),
    18 + 18 + 8 // incentivesBalance (18), rewardTokenPriceEth (18), ethPriceUsd (8)
  );

  const aavePerMonth = formatEther(
    valueToBigNumber(stakeUserData?.stakeTokenRedeemableAmount || '0')
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

      <Stack
        spacing={4}
        direction={{ xs: 'column', xsm: 'row' }}
        sx={{ mt: 4, alignItems: { xsm: 'start' } }}
      >
        {/** Cooldown action */}
        <StakeActionBox
          title={
            <>
              <Trans>Staked</Trans> {stakedToken}
            </>
          }
          value={formatEther(stakeUserData?.stakeTokenRedeemableAmount || '0')}
          valueUSD={stakedUSD}
          dataCy={`stakedBox_${stakedToken}`}
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
              event={{
                eventName: GENERAL.TOOL_TIP,
                eventParams: {
                  tooltip: 'Staking cooldown',
                  funnel: 'Staking Page',
                  assetName: stakedToken,
                },
              }}
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
          cooldownAmount={
            isCooldownActive || isUnstakeWindowActive ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between',
                  pt: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  <Trans>Amount in cooldown</Trans>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon symbol={icon} sx={{ mr: 1, width: 14, height: 14 }} />
                  <FormattedNumber
                    value={formatEther(stakeUserData?.userCooldownAmount || 0)}
                    variant="secondary14"
                    color="text.primary"
                  />
                </Box>
              </Box>
            ) : (
              <></>
            )
          }
          gradientBorder={isUnstakeWindowActive}
        >
          {isUnstakeWindowActive && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="gradient"
                fullWidth
                onClick={onUnstakeAction}
                data-cy={`unstakeBtn_${stakedToken}`}
              >
                <Trans>Unstake now</Trans>
              </Button>
              {availableToReactivateCooldown && (
                <DarkTooltip
                  title={
                    <Typography
                      variant="caption"
                      color="common.white"
                      sx={{ textAlign: 'center', width: '162px' }}
                    >
                      <Trans>
                        Reactivate cooldown period to unstake{' '}
                        {Number(
                          formatEther(stakeUserData?.stakeTokenRedeemableAmount || 0)
                        ).toFixed(2)}{' '}
                        {stakedToken}
                      </Trans>
                    </Typography>
                  }
                >
                  <Button
                    variant="outlined"
                    data-cy={`reCoolDownBtn_${stakedToken}`}
                    sx={{ ml: 1, height: '36px', width: '36px', minWidth: '36px' }}
                    onClick={onCooldownAction}
                  >
                    <SvgIcon sx={{ width: 20, height: 20 }}>
                      <RefreshIcon />
                    </SvgIcon>
                  </Button>
                </DarkTooltip>
              )}
            </Box>
          )}

          {isCooldownActive && !isUnstakeWindowActive && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                fullWidth
                disabled
                data-cy={`awaitCoolDownBtn_${stakedToken}`}
                sx={{ height: '36px' }}
              >
                <Trans>Cooling down...</Trans>
              </Button>
              {availableToReactivateCooldown && (
                <DarkTooltip
                  title={
                    <Typography
                      variant="caption"
                      color="common.white"
                      sx={{ textAlign: 'center', width: '162px' }}
                    >
                      <Trans>
                        Reactivate cooldown period to unstake{' '}
                        {Number(
                          formatEther(stakeUserData?.stakeTokenRedeemableAmount || 0)
                        ).toFixed(2)}{' '}
                        {stakedToken}
                      </Trans>
                    </Typography>
                  }
                >
                  <Button
                    variant="outlined"
                    data-cy={`reCoolDownBtn_${stakedToken}`}
                    sx={{ ml: 1, height: '36px', width: '36px', minWidth: '36px' }}
                    onClick={onCooldownAction}
                  >
                    <SvgIcon sx={{ width: 20, height: 20 }}>
                      <RefreshIcon />
                    </SvgIcon>
                  </Button>
                </DarkTooltip>
              )}
            </Box>
          )}

          {!isCooldownActive && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onCooldownAction}
              disabled={stakeUserData?.stakeTokenRedeemableAmount === '0'}
              data-cy={`coolDownBtn_${stakedToken}`}
            >
              <Trans>Cooldown to unstake</Trans>
            </Button>
          )}
        </StakeActionBox>

        <StakeActionBox
          title={<Trans>Claimable MCAKE</Trans>}
          value={formatEther(stakeUserData?.userIncentivesToClaim || '0')}
          valueUSD={claimableUSD}
          bottomLineTitle={<Trans>Mooncake Finance per month</Trans>}
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: { sm: 'row', xs: 'column' },
              justifyContent: 'space-between',
            }}
          >
            <Button
              variant="contained"
              onClick={onStakeRewardClaimAction}
              disabled={stakeUserData?.userIncentivesToClaim === '0'}
              data-cy={`claimBtn_${stakedToken}`}
              sx={{
                flex: 1,
                mb: { xs: 2, sm: 0 },
                mr: { xs: 0, sm: 1 },
              }}
            >
              <Trans>Claim</Trans>
            </Button>
            {stakedToken === 'MCAKE' && (
              <Button
                variant="contained"
                onClick={onStakeRewardClaimRestakeAction}
                disabled={stakeUserData?.userIncentivesToClaim === '0'}
                data-cy={`claimBtn_${stakedToken}`}
                style={{ flex: 1 }} // marginLeft adds space between buttons
              >
                <Trans>Restake</Trans>
              </Button>
            )}
          </Box>
        </StakeActionBox>
      </Stack>

      {!!description && description}

      {hasDiscountProgram && (
        <Box
          sx={{
            mt: {
              xs: '20px',
              xsm: '36px',
            },
            px: {
              xsm: 6,
            },
            width:
              STAGING_ENV || ENABLE_TESTNET
                ? {
                  xs: '100%',
                  lg: '50%',
                }
                : '100%',
            marginX: 'auto',
          }}
        >
          <GhoDiscountProgram />
        </Box>
      )}
    </Paper>
  );
};
