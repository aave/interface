import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Skeleton, Stack, Typography } from '@mui/material';
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

export const SavingsGho = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.gho);
  const { data: stakeGeneralResult, isLoading: stakeDataLoading } = useGeneralStakeUiData(
    currentMarketData,
    Stake.gho
  );
  const { openSavingsGhoDeposit, openSavingsGhoWithdraw } = useModalContext();
  const now = useCurrentTimestamp(1);
  const { data: meritIncentives } = useMeritIncentives({
    symbol: 'GHO',
    market: currentMarketData.market,
  });

  const apr = meritIncentives?.incentiveAPR || '0';
  const aprFormatted = (+apr * 100).toFixed(2);

  const stakeData = stakeGeneralResult?.[0];
  const stakeUserData = stakeUserResult?.[0];

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
    <Stack direction="column" gap={4}>
      <Typography gutterBottom>
        Stake GHO is now Savings GHO. With no risk of slashing and immediate withdraws available,
        earn up to {aprFormatted}% APR and claim rewards weekly.
      </Typography>
      <Stack direction="row">
        <Stack direction="row" alignItems="center" gap={1}>
          <TokenIcon symbol="sgho" sx={{ width: 24, height: 24 }} />
          <Typography variant="h3">
            <Trans>sGHO</Trans>
          </Typography>
          {!stakeDataLoading && stakeData && (
            <TokenContractTooltip
              explorerUrl={`https://etherscan.io/address/${stakeData.stakeTokenContract}`}
            />
          )}
        </Stack>
        <Divider orientation="vertical" flexItem sx={{ mx: 4, mt: 2, height: '32px' }} />
        <PanelItem
          title={
            <Box display="flex" alignItems="center">
              <Trans>Total deposited</Trans>
            </Box>
          }
        >
          {stakeDataLoading && <Skeleton variant="text" width={145} height={24} />}
          {!stakeDataLoading && stakeData && (
            <Stack direction="row" alignItems="center" gap={1}>
              <FormattedNumber value={stakeData.totalSupplyFormatted} variant="main16" compact />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                {' ('}
                <FormattedNumber
                  variant="caption"
                  value={stakeData.totalSupplyUSDFormatted}
                  visibleDecimals={2}
                  symbol="usd"
                />
                {')'}
              </Box>
            </Stack>
          )}
        </PanelItem>
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

      {stakeUserData && stakeData && (
        <Box sx={{ width: 350 }}>
          <StakeActionBox
            dataCy={`stakedBox_`}
            title={
              <>
                <Trans>sGHO</Trans>
              </>
            }
            value={formatEther(stakeUserData.stakeTokenRedeemableAmount)}
            valueUSD={stakedUSD}
            bottomLineTitle={
              <TextWithTooltip variant="caption" text={<Trans>Cooldown period</Trans>}>
                <Trans>
                  After the cooldown is initiated, you will be able to withdraw your assets
                  immediatley.
                </Trans>
              </TextWithTooltip>
            }
            bottomLineComponent={
              <Typography variant="secondary12">
                <Trans>Instant</Trans>
              </Typography>
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
                      value={formatEther(stakeUserData.userCooldownAmount)}
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
              <Button
                fullWidth
                variant="contained"
                disabled={stakeUserData.underlyingTokenUserBalance === '0'}
                onClick={() => openSavingsGhoDeposit()}
              >
                <Trans>Deposit</Trans>
              </Button>
              {stakeUserData.stakeTokenUserBalance !== '0' && (
                <Button fullWidth variant="outlined" onClick={() => openSavingsGhoWithdraw()}>
                  <Trans>Withdraw</Trans>
                </Button>
              )}
            </Stack>
          </StakeActionBox>
        </Box>
      )}
    </Stack>
  );
};
