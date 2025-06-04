import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Divider, Grid, Paper, Typography, useTheme } from '@mui/material';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { SavingsGhoActionBox } from './SavingsGhoActionBox';
import { SavingsGhoInfoCards } from './SavingsGhoInfoCards';

export const SavingsGhoWrapper = () => {
  const theme = useTheme();
  const { currentAccount } = useWeb3Context();
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.gho);
  const { data: stakeGeneralResult, isLoading: stakeDataLoading } = useGeneralStakeUiData(
    currentMarketData,
    Stake.gho
  );
  const now = useCurrentTimestamp(1);
  const { data: meritIncentives } = useMeritIncentives({
    symbol: 'GHO',
    market: currentMarketData.market,
  });

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

  if (!currentAccount) {
    return (
      <ConnectWalletPaper
        loading={false}
        description={
          <Trans>
            Please connect your wallet to view your Savings GHO position and start earning rewards.
          </Trans>
        }
      />
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={4}>
        {/* Main Action Section */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: { xs: 4, sm: 6 },
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '12px',
            }}
          >
            {/* About Savings GHO Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                <Trans>About Savings GHO</Trans>
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: theme.palette.gradients.aaveGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <TokenIcon symbol="GHO" sx={{ width: 24, height: 24 }} />
                    </Box>
                    <Typography variant="subheader1" sx={{ mb: 1 }}>
                      <Trans>No Risk</Trans>
                    </Typography>
                    <Typography variant="description" color="text.secondary">
                      <Trans>
                        Unlike traditional staking, Savings GHO has no slashing risk. Your funds are
                        always safe.
                      </Trans>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: theme.palette.gradients.aaveGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography variant="subheader1" sx={{ color: 'white' }}>
                        ⚡
                      </Typography>
                    </Box>
                    <Typography variant="subheader1" sx={{ mb: 1 }}>
                      <Trans>Instant Withdrawals</Trans>
                    </Typography>
                    <Typography variant="description" color="text.secondary">
                      <Trans>
                        Withdraw your GHO anytime without waiting periods or cooldown restrictions.
                      </Trans>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: theme.palette.gradients.aaveGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography variant="subheader1" sx={{ color: 'white' }}>
                        📈
                      </Typography>
                    </Box>
                    <Typography variant="subheader1" sx={{ mb: 1 }}>
                      <Trans>Earn Rewards</Trans>
                    </Typography>
                    <Typography variant="description" color="text.secondary">
                      <Trans>
                        Earn competitive APR on your GHO holdings while maintaining full liquidity.
                      </Trans>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Horizontal Divider */}
            <Divider sx={{ mb: 4 }} />

            {/* Your sGHO Position Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TokenIcon symbol="sgho" sx={{ width: 24, height: 24, mr: 2 }} />
                <Typography variant="h3">
                  <Trans>Your sGHO Position</Trans>
                </Typography>
              </Box>
              <Typography variant="description" color="text.secondary">
                <Trans>
                  Deposit GHO to start earning rewards. Your deposits are liquid and can be
                  withdrawn instantly.
                </Trans>
              </Typography>
            </Box>

            {stakeUserData && stakeData ? (
              <SavingsGhoActionBox
                stakeData={stakeData}
                stakeUserData={stakeUserData}
                stakedUSD={stakedUSD}
                isCooldownActive={isCooldownActive}
                isUnstakeWindowActive={isUnstakeWindowActive}
                loading={stakeDataLoading}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  border: `1px dashed ${theme.palette.divider}`,
                  borderRadius: '8px',
                }}
              >
                <Typography variant="description" color="text.secondary">
                  <Trans>Loading your position...</Trans>
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Info Cards Section */}
        <Grid item xs={12} lg={4}>
          <SavingsGhoInfoCards
            stakeData={stakeData}
            meritIncentives={meritIncentives}
            loading={stakeDataLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
