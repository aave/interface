import { Trans } from '@lingui/macro';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { ConnectWalletPaperStaking } from 'src/components/ConnectWalletPaperStaking';
import { ContentContainer } from 'src/components/ContentContainer';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { StakeModal } from 'src/components/transactions/Stake/StakeModal';
import { StakeCooldownModal } from 'src/components/transactions/StakeCooldown/StakeCooldownModal';
import { StakeRewardClaimModal } from 'src/components/transactions/StakeRewardClaim/StakeRewardClaimModal';
import { StakeRewardClaimRestakeModal } from 'src/components/transactions/StakeRewardClaimRestake/StakeRewardClaimRestakeModal';
import { UnStakeModal } from 'src/components/transactions/UnStake/UnStakeModal';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { MainLayout } from 'src/layouts/MainLayout';
import { BuyWithFiat } from 'src/modules/staking/BuyWithFiat';
import { GetABPToken } from 'src/modules/staking/GetABPToken';
import { StakingHeader } from 'src/modules/staking/StakingHeader';
import { StakingPanel } from 'src/modules/staking/StakingPanel';
import { ENABLE_TESTNET, getNetworkConfig, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';

import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';

export default function Staking() {
  const { currentAccount, loading, chainId } = useWeb3Context();

  const { data: stakeUserResult, isLoading: stakeUserResultLoading } = useUserStakeUiData();
  const { data: stakeGeneralResult, isLoading: stakeGeneralResultLoading } =
    useGeneralStakeUiData();

  const stakeDataLoading = stakeUserResultLoading || stakeGeneralResultLoading;

  const {
    openStake,
    openStakeCooldown,
    openUnstake,
    openStakeRewardsClaim,
    openStakeRewardsRestakeClaim,
  } = useModalContext();

  const { breakpoints } = useTheme();
  const lg = useMediaQuery(breakpoints.up('lg'));

  const [mode, setMode] = useState<'aave' | 'bpt' | ''>('');

  const { name: network } = getNetworkConfig(chainId);

  useEffect(() => {
    if (!mode) setMode('aave');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lg]);

  // Total funds at Safety Module (stkaave tvl + stkbpt tvl)
  const tvl = formatUnits(
    BigNumber.from(stakeGeneralResult?.aave.stakeTokenTotalSupply || '0')
      .mul(stakeGeneralResult?.aave.stakeTokenPriceEth || '0')
      .add(
        BigNumber.from(stakeGeneralResult?.bpt.stakeTokenTotalSupply || '0').mul(
          stakeGeneralResult?.bpt.stakeTokenPriceEth || '0'
        )
      )
      .mul(stakeGeneralResult?.ethPriceUsd || 1),
    18 + 18 + 8 // 2x total supply (18 decimals), 1x ethPriceUSD (8 decimals)
  );

  // Total AAVE Emissions (stkaave dps + stkbpt dps)
  const stkEmission = formatEther(
    BigNumber.from(stakeGeneralResult?.aave.distributionPerSecond || '0')
      .add(stakeGeneralResult?.bpt.distributionPerSecond || '0')
      .mul('86400')
  );

  const isStakeAAVE = mode === 'aave';

  return (
    <>
      <StakingHeader tvl={tvl} stkEmission={stkEmission} loading={stakeDataLoading} />

      <ContentContainer>
        {currentAccount ? (
          <>
            <Box
              sx={{
                display: { xs: 'flex', lg: 'none' },
                justifyContent: { xs: 'center', xsm: 'flex-start' },
                mb: { xs: 3, xsm: 4 },
              }}
            >
              <StyledToggleButtonGroup
                color="primary"
                value={mode}
                exclusive
                onChange={(_, value) => setMode(value)}
                sx={{ width: { xs: '100%', xsm: '359px' } }}
              >
                <StyledToggleButton value="aave" disabled={mode === 'aave'}>
                  <Typography variant="subheader1">
                    <Trans>Stake AAVE</Trans>
                  </Typography>
                </StyledToggleButton>
                <StyledToggleButton value="bpt" disabled={mode === 'bpt'}>
                  <Typography variant="subheader1">
                    <Trans>Stake ABPT</Trans>
                  </Typography>
                </StyledToggleButton>
              </StyledToggleButtonGroup>
            </Box>

            <Grid container spacing={4}>
              <Grid
                item
                xs={12}
                lg={STAGING_ENV || ENABLE_TESTNET ? 12 : 6}
                sx={{
                  display: { xs: !isStakeAAVE ? 'none' : 'block', lg: 'block' },
                }}
              >
                <StakingPanel
                  stakeTitle="AAVE"
                  stakedToken="AAVE"
                  maxSlash="0.3"
                  icon="aave"
                  stakeData={stakeGeneralResult?.aave}
                  stakeUserData={stakeUserResult?.aave}
                  ethPriceUsd={stakeGeneralResult?.ethPriceUsd}
                  onStakeAction={() => openStake('aave', 'AAVE')}
                  onCooldownAction={() => openStakeCooldown('aave')}
                  onUnstakeAction={() => openUnstake('aave', 'AAVE')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim('aave', 'AAVE')}
                  onStakeRewardClaimRestakeAction={() =>
                    openStakeRewardsRestakeClaim('aave', 'AAVE')
                  }
                  headerAction={<BuyWithFiat cryptoSymbol="AAVE" networkMarketName={network} />}
                  hasDiscountProgram
                />
              </Grid>
              <Grid
                item
                xs={12}
                lg={6}
                sx={{ display: { xs: isStakeAAVE ? 'none' : 'block', lg: 'block' } }}
              >
                <StakingPanel
                  stakeTitle="ABPT"
                  stakedToken="ABPT"
                  maxSlash="0.3"
                  icon="stkbpt"
                  stakeData={stakeGeneralResult?.bpt}
                  stakeUserData={stakeUserResult?.bpt}
                  ethPriceUsd={stakeGeneralResult?.ethPriceUsd}
                  onStakeAction={() => openStake('bpt', 'stkBPT')}
                  onCooldownAction={() => openStakeCooldown('bpt')}
                  onUnstakeAction={() => openUnstake('bpt', 'stkBPT')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim('bpt', 'AAVE')}
                  headerAction={<GetABPToken />}
                />
              </Grid>
            </Grid>
          </>
        ) : (
          <ConnectWalletPaperStaking
            description={
              <Trans>
                We couldn’t detect a wallet. Connect a wallet to stake and view your balance.
              </Trans>
            }
            loading={loading}
          />
        )}
      </ContentContainer>
    </>
  );
}

Staking.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      {/** Modals */}
      <StakeModal />
      <StakeCooldownModal />
      <UnStakeModal />
      <StakeRewardClaimModal />
      <StakeRewardClaimRestakeModal />
      {/** End of modals */}
    </MainLayout>
  );
};
