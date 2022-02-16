import { Trans } from '@lingui/macro';
import { Grid, Typography } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatEther } from 'ethers/lib/utils';
import { ContentContainer } from 'src/components/ContentContainer';
import { StakeModal } from 'src/components/Stake/StakeModal';
import { StakeCooldownModal } from 'src/components/StakeCooldown/StakeCooldownModal';
import { StakeRewardClaimModal } from 'src/components/StakeRewardClaim/StakeRewardClaimModal';
import { UnStakeModal } from 'src/components/UnStake/UnStakeModal';
import { StakeDataProvider, useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { MainLayout } from 'src/layouts/MainLayout';
import { StakingHeader } from 'src/modules/staking/StakingHeader';
import { StakingPanel } from 'src/modules/staking/StakingPanel';

export default function Staking() {
  const data = useStakeData();
  const { openStake, openStakeCooldown, openUnstake, openStakeRewardsClaim } = useModalContext();
  // Total funds at Safety Module (stkaave tvl + stkbpt tvl)
  const tvl = formatEther(
    BigNumber.from(data.stakeGeneralResult?.stakeGeneralUIData.aave.stakeTokenTotalSupply || '0')
      .mul(data.stakeGeneralResult?.stakeGeneralUIData.aave.stakeTokenPriceEth || '0')
      .add(
        BigNumber.from(
          data.stakeGeneralResult?.stakeGeneralUIData.bpt.stakeTokenTotalSupply || '0'
        ).mul(data.stakeGeneralResult?.stakeGeneralUIData.bpt.stakeTokenPriceEth || '0')
      )
      .div(data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth || 1)
  );

  // Total AAVE Emissions (stkaave dps + stkbpt dps)
  const stkEmission = formatEther(
    BigNumber.from(data.stakeGeneralResult?.stakeGeneralUIData.aave.distributionPerSecond || '0')
      .add(data.stakeGeneralResult?.stakeGeneralUIData.bpt.distributionPerSecond || '0')
      .mul('86400')
  );

  return (
    <>
      <StakingHeader tvl={tvl} stkEmission={stkEmission} />
      <ContentContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <StakingPanel
              sx={{ height: '100%' }}
              stakeTitle="Aave"
              stakedToken="AAVE"
              maxSlash="0.3"
              icon="aave"
              stakeData={data.stakeGeneralResult?.stakeGeneralUIData.aave}
              stakeUserData={data.stakeUserResult?.stakeUserUIData.aave}
              ethUsdPrice={data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth}
              onStakeAction={() => openStake('aave', 'AAVE')}
              onCooldownAction={() => openStakeCooldown('aave')}
              onUnstakeAction={() => openUnstake('aave', 'AAVE')}
              onStakeRewardClaimAction={() => openStakeRewardsClaim('aave')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StakingPanel
              sx={{ height: '100%' }}
              stakeTitle="AAVE/ETH BPT"
              stakedToken="ABPT"
              maxSlash="0.3"
              icon="stkbpt"
              stakeData={data.stakeGeneralResult?.stakeGeneralUIData.bpt}
              stakeUserData={data.stakeUserResult?.stakeUserUIData.bpt}
              ethUsdPrice={data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth}
              onStakeAction={() => openStake('bpt', 'stkBPT')}
              onCooldownAction={() => openStakeCooldown('bpt')}
              onUnstakeAction={() => openUnstake('bpt', 'stkBPT')}
              onStakeRewardClaimAction={() => openStakeRewardsClaim('bpt')}
              description={
                <Typography color="text.muted" sx={{ mt: 4 }}>
                  <Trans>
                    The Balancer Pool Token (BPT) is a liquidity pool token. You can receive BPT by
                    depositing a combination of AAVE + ETH in the Balancer liquidity pool. You can
                    then stake your BPT in the Safety Module to secure the protocol and earn Safety
                    Incentives.
                  </Trans>
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </ContentContainer>

      {/** Modals */}
      <StakeModal />
      <StakeCooldownModal />
      <UnStakeModal />
      <StakeRewardClaimModal />
      {/** End of modals */}
    </>
  );
}

Staking.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      <StakeDataProvider>{page}</StakeDataProvider>
    </MainLayout>
  );
};
