import { Grid, Typography } from '@mui/material';
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
  return (
    <>
      <StakingHeader />
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
              onStakeAction={() => openStake('bpt', 'stkBPT')}
              onCooldownAction={() => openStakeCooldown('bpt')}
              onUnstakeAction={() => openUnstake('bpt', 'stkBPT')}
              onStakeRewardClaimAction={() => openStakeRewardsClaim('bpt')}
              description={
                <Typography color="text.muted" sx={{ mt: 4 }}>
                  The Balancer Pool Token (BPT) is a liquidity pool token. You can receive BPT by
                  depositing a combination of AAVE + ETH in the Balancer liquidity pool. You can
                  then stake your BPT in the Safety Module to secure the protocol and earn Safety
                  Incentives.
                </Typography>
              }
            />
          </Grid>
        </Grid>
        {/** Modals */}
        <StakeModal />
        <StakeCooldownModal />
        <UnStakeModal />
        <StakeRewardClaimModal />
        {/** End of modals */}
        <code style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</code>
      </ContentContainer>
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
