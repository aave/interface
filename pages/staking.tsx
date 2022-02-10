import { Container, Grid, Typography } from '@mui/material';
import { StakeDataProvider, useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { StakingHeader } from 'src/modules/staking/StakingHeader';
import { StakingPanel } from 'src/modules/staking/StakingPanel';

export default function Staking() {
  const data = useStakeData();
  console.log(data);
  return (
    <Container maxWidth="xl">
      <StakingHeader />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <StakingPanel
            sx={{ height: '100%' }}
            stakeTitle="Aave"
            stakedToken="AAVE"
            apr="0.13"
            maxSlash="0.3"
            icon="aave"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StakingPanel
            sx={{ height: '100%' }}
            stakeTitle="AAVE/ETH BPT"
            stakedToken="ABPT"
            apr="0.13"
            maxSlash="0.3"
            icon="pools/bpt"
            description={
              <Typography color="text.muted" sx={{ mt: 4 }}>
                The Balancer Pool Token (BPT) is a liquidity pool token. You can receive BPT by
                depositing a combination of AAVE + ETH in the Balancer liquidity pool. You can then
                stake your BPT in the Safety Module to secure the protocol and earn Safety
                Incentives.
              </Typography>
            }
          />
        </Grid>
      </Grid>

      <code style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</code>
    </Container>
  );
}

Staking.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      <StakeDataProvider>{page}</StakeDataProvider>
    </MainLayout>
  );
};
