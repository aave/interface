import { ChainId } from '@aave/contract-helpers';
import { GetUserStakeUIDataHumanized } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { valueToBigNumber } from '@aave/math-utils';
import { ExternalLinkIcon, RefreshIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import {
  Box,
  Button,
  IconButton,
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
import {
  MeritIncentivesButton,
  UserMeritIncentivesButton,
} from 'src/components/incentives/IncentivesButton';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { StakeActionBox } from './StakeActionBox';
import { StakingPanelSkeleton } from './StakingPanelSkeleton';

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
  onMigrateAction?: () => void;
  stakeData?: StakeTokenFormatted;
  stakeUserData?: GetUserStakeUIDataHumanized['stakeUserData'][0];
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  stakeTitle: string;
  stakedToken: string;
  maxSlash: string;
  icon: string;
  children?: React.ReactNode;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({
  onStakeAction,
  onStakeRewardClaimAction,
  onStakeRewardClaimRestakeAction,
  onCooldownAction,
  onUnstakeAction,
  onMigrateAction,
  headerAction,
  stakedToken,
  stakeTitle,
  icon,
  stakeData,
  stakeUserData,
  maxSlash,
  children,
}) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));
  const now = useCurrentTimestamp(1);
  const { openSwitch } = useModalContext();
  const theme = useTheme();

  if (!stakeData || !stakeUserData) {
    return <StakingPanelSkeleton />;
  }

  const handleSwitchClick = () => {
    openSwitch('', ChainId.mainnet);
  };

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
    BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || '0').mul(
      stakeData?.stakeTokenPriceUSD || '0'
    ),
    18 + 8 // userBalance (18), stakedTokenPriceUSD (8)
  );

  const claimableUSD = formatUnits(
    BigNumber.from(stakeUserData?.userIncentivesToClaim || '0').mul(
      stakeData?.rewardTokenPriceUSD || '0'
    ),
    18 + 8 // incentivesBalance (18), rewardTokenPriceUSD (8)
  );

  let aavePerMonth = '0';
  if (stakeData?.stakeTokenTotalSupply !== '0') {
    aavePerMonth = formatEther(
      valueToBigNumber(stakeUserData?.stakeTokenRedeemableAmount || '0')
        .dividedBy(stakeData?.stakeTokenTotalSupply || '1')
        .multipliedBy(stakeData?.distributionPerSecond || '0')
        .multipliedBy('2592000') // NOTE: Monthly distribution
        .toFixed(0)
    );
  }

  const distributionEnded = Date.now() / 1000 > Number(stakeData.distributionEnd);

  const TokenContractTooltip = (
    <DarkTooltip title="View token contract" sx={{ display: { xsm: 'none' } }}>
      <IconButton
        LinkComponent={Link}
        href={`https://etherscan.io/address/${stakeData.stakeTokenContract}`}
      >
        <SvgIcon sx={{ fontSize: '14px' }}>
          <ExternalLinkIcon />
        </SvgIcon>
      </IconButton>
    </DarkTooltip>
  );

  return (
    <Paper sx={{ px: 5, py: 9, height: '100%' }}>
      <Box
        sx={{
          display: { xs: 'none', xsm: 'flex' },
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 7,
        }}
      >
        <Stack>
          <Typography variant="body4" color="text.primary">
            <Stack direction="row" alignItems="center" gap={0} mb={4}>
              <Trans>Stake CODE on </Trans>
              <TokenIcon symbol={icon} sx={{ width: '24px', height: '24px', ml: 2 }} />
              <Typography variant="h2">
                <Box sx={{ fontSize: '24px', ml: 1.5 }}>{stakeTitle}</Box>
              </Typography>
              {TokenContractTooltip}
            </Stack>
          </Typography>
          <Typography variant="body7" color="text.secondary">
            Total staked:{' '}
            <FormattedNumber
              variant="body7"
              value={stakeData.totalSupplyFormatted}
              visibleDecimals={2}
            />
            {' ('}
            <FormattedNumber
              variant="body7"
              value={stakeData.totalSupplyUSDFormatted}
              visibleDecimals={2}
              symbol="usd"
              symbolsColor="text.secondary"
            />
            {')'}
          </Typography>
        </Stack>
        {/* {headerAction && <Box sx={{ ml: 3 }}>{headerAction}</Box>} */}
      </Box>

      <Box
        sx={(theme) => ({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', xsm: 'center' },
          flexDirection: { xs: 'column', xsm: 'row' },
          gap: { xs: 0, xsm: 2 },
          borderRadius: { xs: 0, xsm: '12px' },
          border: { xs: 'unset', xsm: `1px solid ${theme.palette.divider}` },
          p: { xs: 0, xsm: '12px 8px' },
          mb: 7,
          background: {
            xs: 'unset',
            xsm: 'transparent',
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
            py: '24.5px',
            mb: { xs: 3, xsm: 0 },
          }}
        >
          <Stack direction="row">
            <TokenIcon symbol={icon} sx={{ fontSize: { xs: '40px', xsm: '24px' } }} />
            <Stack direction="column" ml={2} alignItems="start" justifyContent="center">
              <Stack direction="row">
                <Typography variant={xsm ? 'body6' : 'h4'}>{stakedToken}</Typography>
                <Box sx={{ display: { xsm: 'none' } }}>{TokenContractTooltip}</Box>
              </Stack>
              <Typography
                sx={{ display: { xsm: 'none' } }}
                variant="caption"
                color="text.secondary"
              >
                Total staked{' '}
                <FormattedNumber
                  variant="caption"
                  value={stakeData.totalSupplyFormatted}
                  visibleDecimals={2}
                />
                {' ('}
                <FormattedNumber
                  variant="caption"
                  value={stakeData.totalSupplyUSDFormatted}
                  visibleDecimals={2}
                  symbol="usd"
                />
                {')'}
              </Typography>
            </Stack>
          </Stack>
          {headerAction ? (
            <Box sx={{ display: { xs: 'block', xsm: 'none' }, textAlign: 'right', flexGrow: 1 }}>
              {headerAction}
            </Box>
          ) : (
            <Box />
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
          <Stack direction="row">
            <Typography
              variant={xsm ? 'detail2' : 'description'}
              color={xsm ? theme.palette.text.mainTitle : 'text.primary'}
              sx={{ mb: 2 }}
            >
              <Trans>Staking APR</Trans>
            </Typography>
            {distributionEnded && (
              <TextWithTooltip iconColor="warning.main">
                <Trans>
                  The current incentives period, decided on by the Aave community, has ended.
                  Governance is in the process on renewing, check for updates.{' '}
                  <Link
                    href="https://governance.aave.com"
                    sx={{ textDecoration: 'underline' }}
                    variant="caption"
                    color="text.secondary"
                  >
                    Learn more
                  </Link>
                  .
                </Trans>
              </TextWithTooltip>
            )}
          </Stack>
          <Stack direction="row" alignItems="center">
            <FormattedNumber
              sx={{ mr: 2 }}
              value={stakeData.stakeApyFormatted}
              symbol="USD"
              variant="secondary14"
            />
            {/* {stakedToken === 'GHO' ? (
              stakeUserData.stakeTokenUserBalance !== '0' ? (
                <UserMeritIncentivesButton symbol="stkgho" />
              ) : (
                <MeritIncentivesButton symbol="stkgho" />
              )
            ) : null} */}
          </Stack>
        </Box>
        <Box
          sx={{
            display: { xs: 'flex' },
            width: { xs: '100%', xsm: 'unset' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, xsm: 0 },
          }}
        >
          <Typography
            variant={xsm ? 'detail2' : 'description'}
            color={xsm ? theme.palette.text.mainTitle : 'text.primary'}
            sx={{ mb: 2 }}
          >
            <Trans>Max slashing</Trans>
          </Typography>
          <FormattedNumber value={maxSlash} percent variant="secondary14" />
        </Box>
        <Box
          sx={{
            display: { xs: 'flex' },
            width: { xs: '100%', xsm: 'unset' },
            justifyContent: 'space-between',
            flexDirection: 'column',
            alignItems: 'center',
            mb: { xs: 3, xsm: 0 },
          }}
        >
          <Typography
            variant={xsm ? 'detail2' : 'description'}
            color={xsm ? theme.palette.text.mainTitle : 'text.primary'}
            sx={{ mb: 2 }}
          >
            <Trans>Wallet Balance</Trans>
          </Typography>
          <FormattedNumber value={availableToStake.toString()} />
        </Box>

        {/**Stake action */}

        {/* {stakedToken === 'GHO' && +availableToStake === 0 ? (
          <Button
            variant="contained"
            sx={{ minWidth: '96px', mb: { xs: 6, xsm: 0 } }}
            onClick={handleSwitchClick}
            fullWidth={!xsm}
            data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
          >
            <Trans>Get GHO</Trans>
          </Button>
        ) : ( */}
        <Button
          variant="contained"
          sx={{
            p: 2,
            height: '36px',
            ...(+availableToStake === 0 && {
              bgcolor: theme.palette.text.disabledBg,
              color: theme.palette.text.disabledText,
            }),
            bgcolor: theme.palette.point.primary,
            color: theme.palette.text.buttonText,
          }}
          onClick={onStakeAction}
          disabled={+availableToStake === 0 || stakeData.inPostSlashingPeriod}
          fullWidth={!xsm}
          data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
        >
          <Trans>Stake</Trans>
        </Button>
        {/* )} */}
      </Box>

      <Stack
        gap={3}
        direction={{ xs: 'column', xsm: 'row' }}
        sx={{ mt: 4, alignItems: { xsm: 'start' } }}
      >
        {stakeData.inPostSlashingPeriod && (
          <StakeActionBox
            title={
              <>
                <Trans>Staked</Trans> {stakedToken}
              </>
            }
            value={formatEther(stakeUserData?.stakeTokenRedeemableAmount || '0')}
            valueUSD={stakedUSD}
            dataCy={`stakedBox_${stakedToken}`}
            bottomLineTitle={<></>}
            bottomLineComponent={<Box sx={{ height: '20px' }} />}
          >
            <Stack direction="row" gap={2} alignItems="center">
              <Button
                variant="outlined"
                fullWidth
                onClick={onMigrateAction}
                disabled={stakeUserData.stakeTokenUserBalance === '0'}
              >
                Migrate
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={onUnstakeAction}
                disabled={stakeUserData.stakeTokenUserBalance === '0'}
              >
                <Trans>Unstake</Trans>
              </Button>
            </Stack>
          </StakeActionBox>
        )}
        {/** Cooldown action */}
        {!stakeData.inPostSlashingPeriod && (
          <StakeActionBox
            title={
              <>
                <Trans>Staked CODE</Trans>
              </>
            }
            value={formatEther(stakeUserData?.stakeTokenRedeemableAmount || '0')}
            valueUSD={stakedUSD}
            dataCy={`stakedBox_${stakedToken}`}
            bottomLineTitle={
              <TextWithTooltip
                textColor={theme.palette.text.subTitle}
                variant="detail4"
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
                    <Trans>Time remaining until the 48 hour withdraw period starts.</Trans>
                  ) : isUnstakeWindowActive ? (
                    <Trans>Time remaining until the withdraw period ends.</Trans>
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
              <Box sx={{ maxWidth: isCooldownActive ? '150px' : 'unset' }}>
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
              </Box>
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
                  <Typography variant="detail4" color={theme.palette.text.subTitle}>
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
                  variant="contained"
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
                  variant="contained"
                  fullWidth
                  disabled
                  data-cy={`awaitCoolDownBtn_${stakedToken}`}
                  sx={{
                    p: 3,
                    bgcolor: theme.palette.text.disabledBg,
                    color: theme.palette.text.disabledText,
                  }}
                >
                  <AutorenewIcon sx={{ mr: 1 }} />
                  <Trans>Cooling down ...</Trans>
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
                sx={{
                  p: 3,
                  ...(+stakeUserData?.userIncentivesToClaim === 0 && {
                    bgcolor: theme.palette.text.disabledBg,
                    color: theme.palette.text.disabledText,
                  }),
                  bgcolor: theme.palette.point.primary,
                  color: theme.palette.text.buttonText,
                }}
                variant="contained"
                fullWidth
                onClick={onCooldownAction}
                disabled={stakeUserData?.stakeTokenRedeemableAmount === '0'}
                data-cy={`coolDownBtn_${stakedToken}`}
              >
                <Trans>Cooldown to unstake</Trans>
              </Button>
            )}
          </StakeActionBox>
        )}

        <StakeActionBox
          title={<Trans>Claimable CODE</Trans>}
          value={formatEther(stakeUserData?.userIncentivesToClaim || '0')}
          valueUSD={claimableUSD}
          bottomLineTitle={<Trans>CODE per month</Trans>}
          dataCy={`rewardBox_${stakedToken}`}
          bottomLineComponent={
            <FormattedNumber
              value={aavePerMonth}
              visibleDecimals={2}
              variant="secondary14"
              color={+aavePerMonth === 0 ? theme.palette.text.disabledText : 'text.primary'}
            />
          }
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { sm: 'row', xs: 'column' },
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Button
              variant="contained"
              onClick={onStakeRewardClaimAction}
              disabled={stakeUserData?.userIncentivesToClaim === '0'}
              data-cy={`claimBtn_${stakedToken}`}
              sx={{
                flex: 1,
                p: 3,
                ...(+stakeUserData?.userIncentivesToClaim === 0 && {
                  bgcolor: theme.palette.text.disabledBg,
                  color: theme.palette.text.disabledText,
                }),
                bgcolor: theme.palette.point.primary,
                color: theme.palette.text.buttonText,
              }}
            >
              <Trans>Claim</Trans>
            </Button>
            {stakedToken && (
              <Button
                variant="contained"
                onClick={onStakeRewardClaimRestakeAction}
                disabled={stakeUserData?.userIncentivesToClaim === '0'}
                data-cy={`restakeBtn_${stakedToken}`}
                sx={{
                  flex: 1,
                  p: 3,
                  ...(+stakeUserData?.userIncentivesToClaim === 0 && {
                    bgcolor: theme.palette.text.disabledBg,
                    color: theme.palette.text.disabledText,
                  }),
                  bgcolor: theme.palette.point.primary,
                  color: theme.palette.text.buttonText,
                }}
              >
                <Trans>Restake</Trans>
              </Button>
            )}
          </Box>
        </StakeActionBox>
      </Stack>
      {children}
    </Paper>
  );
};
