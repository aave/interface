import { ChainId, Stake } from '@aave/contract-helpers';
import { GetUserStakeUIDataHumanized } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { TimeWindow } from '@aave/react';
import { RefreshIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Divider,
  Grid,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import React, { useState } from 'react';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { SecondsToString } from 'src/components/SecondsToString';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useSGhoApyHistory } from 'src/hooks/useSGhoApyHistory';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { GENERAL, SAFETY_MODULE } from 'src/utils/events';
import { convertAprToApy } from 'src/utils/utils';

import { MeritApyGraphContainer } from '../reserve-overview/graphs/MeritApyGraphContainer';
import { TimeRangeSelector } from '../reserve-overview/TimeRangeSelector';
import { StakeActionBox } from '../staking/StakeActionBox';

export interface SGHODepositPanelProps {
  onStakeAction?: () => void;
  onStakeRewardClaimAction?: () => void;
  onCooldownAction?: () => void;
  onUnstakeAction?: () => void;
  stakeData?: StakeTokenFormatted;
  stakeUserData?: GetUserStakeUIDataHumanized['stakeUserData'][0];
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  stakeTitle?: string;
  stakedToken: string;
  maxSlash?: string;
  icon?: string;
  children?: React.ReactNode;
}

export const SGHODepositPanel: React.FC<SGHODepositPanelProps> = ({
  onStakeAction,
  onCooldownAction,
  onUnstakeAction,
  stakedToken,
  stakeData,
  stakeUserData,
}) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));
  const now = useCurrentTimestamp(30);
  const { openSwitch, openStakeRewardsClaim } = useModalContext();
  const { currentAccount } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeWindow>(TimeWindow.LastWeek);

  const {
    data: meritApyHistory,
    loading: loadingMeritApy,
    error: errorMeritApyHistory,
    refetch: refetchMeritApyHistory,
  } = useSGhoApyHistory({ timeRange: selectedTimeRange });
  const { data: stakeAPR } = useStakeTokenAPR();
  const stakeApyDecimal = stakeAPR?.apr ? convertAprToApy(parseFloat(stakeAPR.apr)) : 0;

  if (!stakeData) {
    return (
      <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 4, minHeight: '600px' }}>
        <Grid item xs={12} md={2}>
          <Box sx={{ mb: { xs: 2, md: 2 } }}>
            <Skeleton variant="rectangular" width={150} height={32} />
          </Box>
        </Grid>

        <Grid item xs={12} md={10}>
          <Box sx={{ mb: { xs: 3, md: 0 } }}>
            <Skeleton variant="rectangular" width={'100%'} height={24} sx={{ mb: 2 }} />
          </Box>

          {/* Main content box skeleton */}
          {currentAccount && (
            <Box
              sx={(theme) => ({
                borderRadius: { xs: '8px', xsm: '6px' },
                border: `1px solid ${theme.palette.divider}`,
                p: { xs: 3, xsm: 4 },
                marginBottom: 4,
                background: theme.palette.background.paper,
                boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.04)', xsm: 'none' },
              })}
            >
              <Stack spacing={3}>
                <Skeleton variant="rectangular" width={'100%'} height={60} />
                <Skeleton variant="rectangular" width={'100%'} height={80} />
              </Stack>
            </Box>
          )}

          {/* Action boxes skeleton */}
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
            <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ borderRadius: 1 }} />
          </Stack>

          {/* Graph skeleton */}
          <Box sx={{ mt: 4 }}>
            <Skeleton variant="rectangular" width={'100%'} height={200} sx={{ borderRadius: 1 }} />
          </Box>
        </Grid>
      </Grid>
    );
  }

  const handleSwitchClick = () => {
    openSwitch('', ChainId.mainnet);
  };

  // Cooldown logic - sGHO has instant withdrawal no cooldown mechanism
  const stakeCooldownSeconds = 0;
  const userCooldown = stakeUserData?.userCooldownTimestamp || 0;
  const stakeUnstakeWindow = 0; // sGHO has no unstake window

  const userCooldownDelta = now - userCooldown;
  // For sGHO, cooldown is always inactive since withdrawal is instant
  const isCooldownActive = false;
  const isUnstakeWindowActive = false;

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

  const onStakeRewardClaimAction = () => {
    trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
      action: SAFETY_MODULE.OPEN_CLAIM_MODAL,
      asset: 'GHO',
      stakeType: 'Safety Module',
      rewardType: 'Claim',
    });
    openStakeRewardsClaim(Stake.gho, 'AAVE');
  };

  return (
    <>
      {currentAccount && (
        <>
          <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 4 }}>
            <Grid item xs={12} md={2}>
              <Box sx={{ mb: { xs: 2, md: 2 } }}>
                <Typography variant={xsm ? 'h4' : 'subheader1'} sx={{ mb: { xs: 1, md: 0 } }}>
                  Deposit GHO
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={10}>
              <Box sx={{ mb: { xs: 3, md: 0 } }}>
                <Typography
                  sx={{
                    mb: { xs: 3, md: 1 },
                    fontWeight: { md: 400 },
                    // fontSize: { xs: '1.1rem', md: '1rem' },
                  }}
                >
                  <Trans>Deposit GHO and earn {(stakeApyDecimal * 100).toFixed(2)}% APY</Trans>
                </Typography>
              </Box>
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  justifyContent: { xs: 'center', xsm: 'space-between' },
                  alignItems: { xs: 'stretch', xsm: 'center' },
                  flexDirection: { xs: 'column', xsm: 'row' },
                  gap: { xs: 3, xsm: 2 },
                  borderRadius: { xs: '8px', xsm: '6px' },
                  border: {
                    xs: `1px solid ${theme.palette.divider}`,
                    xsm: `1px solid ${theme.palette.divider}`,
                  },
                  p: { xs: 3, xsm: 4 },
                  marginBottom: 4,
                  background: theme.palette.background.paper,
                  boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.04)', xsm: 'none' },
                })}
              >
                {/* First row on xs: APR and GHO Balance side by side */}
                <Box
                  sx={{
                    display: { xs: 'flex', xsm: 'block' },
                    justifyContent: { xs: 'space-between', xsm: 'unset' },
                    alignItems: { xs: 'flex-start', xsm: 'unset' },
                    mb: { xs: 2, xsm: 0 },
                    flex: { xs: 'none', xsm: 'flex' },
                  }}
                >
                  <Box
                    sx={{
                      textAlign: 'left',
                    }}
                  >
                    <Typography
                      variant={xsm ? 'caption' : 'description'}
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      <Trans>Current APY</Trans>
                    </Typography>

                    <MeritIncentivesButton symbol={'GHO'} market={CustomMarket.proto_mainnet_v3} />
                  </Box>

                  {!xsm && +availableToStake > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        textAlign: 'right',
                      }}
                    >
                      <Typography variant="description" color="text.secondary" sx={{ mb: 0.5 }}>
                        <Trans>GHO Balance</Trans>
                      </Typography>
                      <FormattedNumber value={availableToStake.toString()} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: { xs: 'none', xsm: 'none' } }}>
                  {+availableToStake === 0 ? (
                    <Button
                      variant="contained"
                      size={xsm ? 'medium' : 'large'}
                      sx={{
                        minWidth: { xs: '140px', xsm: '96px' },
                        height: { xs: '48px', xsm: '36px' },
                        // fontSize: { xs: '1rem', xsm: '0.875rem' },
                      }}
                      onClick={handleSwitchClick}
                      fullWidth={!xsm}
                      data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
                    >
                      <Trans>Get GHO</Trans>
                    </Button>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: { xs: 'center', xsm: 'center' },
                        flexDirection: { xs: 'column', xsm: 'row' },
                        gap: { xs: 0, xsm: 3 },
                        width: { xs: '100%', xsm: 'auto' },
                      }}
                    >
                      {xsm && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'left',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                            <Trans>GHO Balance</Trans>
                          </Typography>
                          <FormattedNumber value={availableToStake.toString()} />
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        // size={xsm ? 'small' : 'large'}
                        sx={{
                          minWidth: { xs: '140px', xsm: '96px' },
                          fontSize: { xs: '1rem', xsm: '0.875rem' },
                        }}
                        onClick={onStakeAction}
                        disabled={+availableToStake === 0 || stakeData.inPostSlashingPeriod}
                        fullWidth={!xsm}
                        data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
                      >
                        <Trans>Deposit</Trans>
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box>
                <StakeActionBox
                  title={<Trans>sGHO</Trans>}
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
                          <Trans>Time remaining until the 48 hour withdraw period starts.</Trans>
                        ) : isUnstakeWindowActive ? (
                          <Trans>Time remaining until the withdraw period ends.</Trans>
                        ) : (
                          <Trans>
                            You can only withdraw your assets from the Security Module after the
                            cooldown period ends and the unstake window is active.
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
                        <Typography variant="secondary12">
                          <Trans>Instant</Trans>
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
                          <TokenIcon symbol="GHO" sx={{ mr: 1, width: 14, height: 14 }} />
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
                        <Trans>Withdraw</Trans>
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
                      <Trans>Withdraw</Trans>
                    </Button>
                  )}
                </StakeActionBox>

                {stakeUserData?.userIncentivesToClaim &&
                  parseFloat(stakeUserData?.userIncentivesToClaim) > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <StakeActionBox
                        title={<Trans>Claimable AAVE</Trans>}
                        value={formatEther(stakeUserData?.userIncentivesToClaim || '0')}
                        valueUSD={claimableUSD}
                        bottomLineTitle={<></>}
                        dataCy={`rewardBox_${stakedToken}`}
                        bottomLineComponent={<Box sx={{ height: '19px' }} />}
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
                              // maxWidth: '100px',
                            }}
                          >
                            <Trans>Claim</Trans>
                          </Button>
                        </Box>
                      </StakeActionBox>
                    </Box>
                  )}
              </Box>
            </Grid>
          </Grid>

          <Divider />
        </>
      )}

      <Grid container spacing={2} sx={{ mb: 4, mt: currentAccount && stakeUserData ? 8 : 0 }}>
        <Grid item xs={12} md={2}>
          <Box>
            <Typography variant="subheader1">Savings Rate</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={10}>
          <Stack
            divider={<Divider orientation={xsm ? 'vertical' : 'horizontal'} flexItem />}
            direction={{ xs: 'column', xsm: 'row' }}
            spacing={{ xs: 2, xsm: 8 }}
          >
            <Box>
              <Typography
                variant={xsm ? 'subheader2' : 'description'}
                color={xsm ? 'text.secondary' : 'text.primary'}
              >
                <Trans>Total Deposited</Trans>
              </Typography>
              <FormattedNumber
                sx={{ mr: 2 }}
                value={stakeData.totalSupplyUSDFormatted}
                variant="secondary14"
                symbol="USD"
                visibleDecimals={2}
              />
            </Box>

            <Box>
              <Typography
                variant={xsm ? 'subheader2' : 'description'}
                color={xsm ? 'text.secondary' : 'text.primary'}
              >
                <Trans>APY</Trans>
              </Typography>
              <FormattedNumber
                sx={{ mr: 2 }}
                value={stakeApyDecimal}
                percent
                variant="secondary14"
              />
            </Box>
          </Stack>

          <MeritApyGraphContainer
            data={meritApyHistory}
            loading={loadingMeritApy}
            error={errorMeritApyHistory}
            onRetry={refetchMeritApyHistory}
            title="GHO APY"
            lineColor="#2EBAC6"
            showAverage={true}
            height={155}
            timeRangeSelector={
              <TimeRangeSelector
                disabled={loadingMeritApy || errorMeritApyHistory}
                timeRanges={[TimeWindow.LastWeek, TimeWindow.LastMonth, TimeWindow.LastSixMonths]}
                selectedTimeRange={selectedTimeRange}
                onTimeRangeChanged={setSelectedTimeRange}
              />
            }
          />
        </Grid>
      </Grid>
    </>
  );
};
