import { ChainId } from '@aave/contract-helpers';
import { GetUserStakeUIDataHumanized } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
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
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import React from 'react';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { TokenContractTooltip } from 'src/components/infoTooltips/TokenContractTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { SecondsToString } from 'src/components/SecondsToString';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { GENERAL } from 'src/utils/events';

import { StakeActionBox } from './StakeActionBox';
import { StakingPanelSkeleton } from './StakingPanelSkeleton';

export interface GhoStakingPanelProps {
  onStakeAction?: () => void;
  onStakeRewardClaimAction?: () => void;
  onCooldownAction?: () => void;
  onUnstakeAction?: () => void;
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

export const GhoStakingPanel: React.FC<GhoStakingPanelProps> = ({
  onStakeAction,
  onStakeRewardClaimAction,
  onCooldownAction,
  onUnstakeAction,
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

  // let aavePerMonth = '0';
  // if (stakeData?.stakeTokenTotalSupply !== '0') {
  //   aavePerMonth = formatEther(
  //     valueToBigNumber(stakeUserData?.stakeTokenRedeemableAmount || '0')
  //       .dividedBy(stakeData?.stakeTokenTotalSupply || '1')
  //       .multipliedBy(stakeData?.distributionPerSecond || '0')
  //       .multipliedBy('2592000') // NOTE: Monthly distribution
  //       .toFixed(0)
  //   );
  // }

  // const distributionEnded = Date.now() / 1000 > Number(stakeData.distributionEnd);

  return (
    <Paper sx={{ p: { xs: 4, xsm: 6 }, pt: 4, height: '100%' }}>
      <Box
        sx={{
          display: { xs: 'none', xsm: 'flex' },
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 8,
        }}
      >
        <Stack>
          <Typography variant="h3">
            <Stack direction="row" alignItems="center" gap={1}>
              {stakeTitle}
              <TokenContractTooltip
                explorerUrl={`https://etherscan.io/address/${stakeData.stakeTokenContract}`}
              />
            </Stack>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total deposited:{' '}
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
          <Stack direction="row">
            <TokenIcon symbol={icon} sx={{ fontSize: { xs: '40px', xsm: '32px' } }} />
            <Stack direction="column" ml={2} alignItems="start" justifyContent="center">
              <Stack direction="row">
                <Typography variant={xsm ? 'subheader1' : 'h4'}>sGHO</Typography>
                <Box sx={{ display: { xsm: 'none' } }}>
                  <TokenContractTooltip
                    explorerUrl={`https://etherscan.io/address/${stakeData.stakeTokenContract}`}
                  />
                </Box>
              </Stack>
              <Typography
                sx={{ display: { xsm: 'none' } }}
                variant="caption"
                color="text.secondary"
              >
                Total deposited{' '}
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
              variant={xsm ? 'subheader2' : 'description'}
              color={xsm ? 'text.secondary' : 'text.primary'}
            >
              <Trans>Deposit APR </Trans>
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center">
            <MeritIncentivesButton symbol={stakedToken} market={CustomMarket.proto_mainnet_v3} />
          </Stack>
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

        {+availableToStake === 0 ? (
          <Button
            variant="contained"
            sx={{ minWidth: '96px', mb: { xs: 6, xsm: 0 } }}
            onClick={handleSwitchClick}
            fullWidth={!xsm}
            data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
          >
            <Trans>Get GHO</Trans>
          </Button>
        ) : (
          <Button
            variant="contained"
            sx={{ minWidth: '96px', mb: { xs: 6, xsm: 0 } }}
            onClick={onStakeAction}
            disabled={+availableToStake === 0 || stakeData.inPostSlashingPeriod}
            fullWidth={!xsm}
            data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
          >
            <Trans>Deposit</Trans>
          </Button>
        )}
      </Box>

      <Stack
        spacing={4}
        direction={{ xs: 'column', xsm: 'row' }}
        sx={{ mt: 4, alignItems: { xsm: 'start' } }}
      >
        {/** Cooldown action */}
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
              }}
            >
              <Trans>Claim</Trans>
            </Button>
          </Box>
        </StakeActionBox>
      </Stack>
      {children}
    </Paper>
  );
};
