import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { TokenContractTooltip } from 'src/components/infoTooltips/TokenContractTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useModalContext } from 'src/hooks/useModal';
import { StakeActionBox } from 'src/modules/staking/StakeActionBox';
import { useRootStore } from 'src/store/root';

import { PanelItem } from '../ReservePanels';

function secondsToDHMS(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return { d, h, m, s };
}

export function SecondsToString({ seconds }: { seconds: number }) {
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

export const SavingsGho = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.gho);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData, Stake.gho);
  const { openStakeCooldown, openSavingsGhoDeposit, openSavingsGhoWithdraw } = useModalContext();
  const now = useCurrentTimestamp(1);
  const { data: meritIncentives } = useMeritIncentives({
    symbol: 'GHO',
    market: currentMarketData.market,
  });

  const apr = meritIncentives?.incentiveAPR || '0';
  const aprFormatted = (+apr * 100).toFixed(2);

  console.log('meritIncentives', meritIncentives);
  const stakeData = stakeGeneralResult?.[0];
  const stakeUserData = stakeUserResult?.[0];

  if (!stakeData || !stakeUserData) {
    return <>loading...</>;
  }

  const availableToStake = formatEther(
    BigNumber.from(stakeUserData?.underlyingTokenUserBalance || '0')
  );

  const stakedUSD = formatUnits(
    BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || '0').mul(
      stakeData?.stakeTokenPriceUSD || '0'
    ),
    18 + 8 // userBalance (18), stakedTokenPriceUSD (8)
  );

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

  return (
    <Stack direction="column" gap={2}>
      <Typography gutterBottom>
        Stake GHO is now Savings GHO. With no risk of slashing and immediate withdraws available,
        earn up to {aprFormatted}%.
      </Typography>
      <Stack direction="row">
        <Stack direction="row" alignItems="center" gap={1}>
          <TokenIcon symbol="stkgho" sx={{ width: 24, height: 24 }} />
          <Typography variant="h3">
            <Trans>sGHO</Trans>
          </Typography>
          <TokenContractTooltip
            explorerUrl={`https://etherscan.io/address/${stakeData.stakeTokenContract}`}
          />
        </Stack>
        <Divider orientation="vertical" flexItem sx={{ mx: 4, mt: 2, height: '32px' }} />
        <PanelItem
          title={
            <Box display="flex" alignItems="center">
              <Trans>Total deposited</Trans>
            </Box>
          }
        >
          <Box>
            <FormattedNumber value={stakeData.totalSupplyFormatted} variant="main16" compact />
            {' ('}
            <FormattedNumber
              variant="caption"
              value={stakeData.totalSupplyUSDFormatted}
              visibleDecimals={2}
              symbol="usd"
            />
            {')'}
          </Box>
        </PanelItem>
        {/* <Divider orientation="vertical" flexItem sx={{ mx: 4 }} /> */}
        <PanelItem
          title={
            <Box display="flex" alignItems="center">
              <Trans>APR</Trans>
            </Box>
          }
        >
          <MeritIncentivesButton symbol="GHO" market={currentMarketData.market} />
        </PanelItem>
      </Stack>

      {/* <Button
        variant="contained"
        sx={{ minWidth: '96px', mb: { xs: 6, xsm: 0 } }}
        onClick={() => openSavingsGhoDeposit()}
        disabled={+availableToStake === 0}
        fullWidth={false}
      >
        <Trans>Stake</Trans>
      </Button> */}

      {/* <Stack>
        <Typography variant="h3">
          <Stack direction="row" alignItems="center" gap={1}>
            <TokenIcon symbol="stkgho" sx={{ width: 24, height: 24 }} />
            <Trans>sGHO</Trans>
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

      <FormattedNumber value={meritIncentives?.incentiveAPR || '0'} percent variant="main16" /> */}

      <Box sx={{ width: 350 }}>
        <StakeActionBox
          dataCy={`stakedBox_`}
          title={
            <>
              <Trans>sGHO</Trans>
            </>
          }
          value={formatEther(stakeUserData?.stakeTokenRedeemableAmount || '0')}
          valueUSD={stakedUSD}
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
              // event={{
              //   eventName: GENERAL.TOOL_TIP,
              //   eventParams: {
              //     tooltip: 'Staking cooldown',
              //     funnel: 'Staking Page',
              //     assetName: stakedToken,
              //   },
              // }}
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
          <Stack direction="row" gap={1} sx={{ width: '100%' }}>
            {stakeUserData?.underlyingTokenUserBalance !== '0' && (
              <Button fullWidth variant="contained" onClick={() => openSavingsGhoDeposit()}>
                <Trans>Deposit</Trans>
              </Button>
            )}
            {stakeUserData?.stakeTokenUserBalance !== '0' && (
              <Button fullWidth variant="outlined" onClick={() => openSavingsGhoWithdraw()}>
                <Trans>Withdraw</Trans>
              </Button>
            )}
          </Stack>
          {/* {isUnstakeWindowActive && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="gradient"
              fullWidth
              onClick={() => openSavingsGhoWithdraw()}
              data-cy={`unstakeBtn_`}
            >
              <Trans>Unstake now</Trans>
            </Button>
          </Box>
        )}

        {isCooldownActive && !isUnstakeWindowActive && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              fullWidth
              disabled
              data-cy={`awaitCoolDownBtn_`}
              sx={{ height: '36px' }}
            >
              <Trans>Cooling down...</Trans>
            </Button>
          </Box>
        )}

        {!isCooldownActive && (
          <Button
            variant="outlined"
            fullWidth
            onClick={() => openStakeCooldown(Stake.gho, 'GHO')}
            disabled={stakeUserData?.stakeTokenRedeemableAmount === '0'}
            data-cy={`coolDownBtn_`}
          >
            <Trans>Cooldown to unstake</Trans>
          </Button>
        )} */}
        </StakeActionBox>
      </Box>
    </Stack>
  );
};
