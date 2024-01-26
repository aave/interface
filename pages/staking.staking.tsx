import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Grid, Typography } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { ConnectWalletPaperStaking } from 'src/components/ConnectWalletPaperStaking';
import { ContentContainer } from 'src/components/ContentContainer';
import { Warning } from 'src/components/primitives/Warning';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { MainLayout } from 'src/layouts/MainLayout';
import { GetABPToken } from 'src/modules/staking/GetABPToken';
import { GhoDiscountProgram } from 'src/modules/staking/GhoDiscountProgram';
// import { GetGhoToken } from 'src/modules/staking/GetGhoToken';
import { StakingHeader } from 'src/modules/staking/StakingHeader';
import { StakingPanel } from 'src/modules/staking/StakingPanel';
import { useRootStore } from 'src/store/root';
import { ENABLE_TESTNET, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';

import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';

const StakeModal = dynamic(() =>
  import('../src/components/transactions/Stake/StakeModal').then((module) => module.StakeModal)
);
const StakeCooldownModal = dynamic(() =>
  import('../src/components/transactions/StakeCooldown/StakeCooldownModal').then(
    (module) => module.StakeCooldownModal
  )
);
const StakeRewardClaimModal = dynamic(() =>
  import('../src/components/transactions/StakeRewardClaim/StakeRewardClaimModal').then(
    (module) => module.StakeRewardClaimModal
  )
);
const StakeRewardClaimRestakeModal = dynamic(() =>
  import(
    '../src/components/transactions/StakeRewardClaimRestake/StakeRewardClaimRestakeModal'
  ).then((module) => module.StakeRewardClaimRestakeModal)
);
const UnStakeModal = dynamic(() =>
  import('../src/components/transactions/UnStake/UnStakeModal').then(
    (module) => module.UnStakeModal
  )
);

export default function Staking() {
  const { currentAccount, loading } = useWeb3Context();

  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stakeUserResult, isLoading: stakeUserResultLoading } =
    useUserStakeUiData(currentMarketData);

  const { data: stakeGeneralResult, isLoading: stakeGeneralResultLoading } =
    useGeneralStakeUiData(currentMarketData);

  let stkAave, stkBpt, stkGho, stkBptV2;

  if (stakeGeneralResult && Array.isArray(stakeGeneralResult.stakeData)) {
    [stkAave, stkBpt, stkGho, stkBptV2] = stakeGeneralResult.stakeData;
  }

  let stkAaveUserData, stkBptUserData, stkGhoUserData, stkBptV2UserData;
  if (stakeUserResult && Array.isArray(stakeUserResult.stakeUserData)) {
    [stkAaveUserData, stkBptUserData, stkGhoUserData, stkBptV2UserData] =
      stakeUserResult.stakeUserData;
  }

  const stakeDataLoading = stakeUserResultLoading || stakeGeneralResultLoading;

  const {
    openStake,
    openStakeCooldown,
    openUnstake,
    openStakeRewardsClaim,
    openStakeRewardsRestakeClaim,
    openStakingMigrate,
  } = useModalContext();

  const [mode, setMode] = useState<Stake>(Stake.aave);

  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Staking',
    });
  }, [trackEvent]);

  const tvl = formatUnits(
    BigNumber.from(stkAave?.stakeTokenTotalSupply || '0')
      .mul(stkAave?.stakeTokenPriceUSD || '0')
      .add(
        BigNumber.from(stkBpt?.stakeTokenTotalSupply || '0').mul(stkBpt?.stakeTokenPriceUSD || '0')
      )
      .add(
        BigNumber.from(stkGho?.stakeTokenTotalSupply || '0').mul(stkGho?.stakeTokenPriceUSD || '0')
      ), // "0"
    18 + 8
  );

  // Total AAVE Emissions (stkaave dps + stkbpt dps)
  const stkEmission = formatEther(
    BigNumber.from(stkAave?.distributionPerSecond || '0')
      .add(stkBpt?.distributionPerSecond || '0')
      .add(stkGho?.distributionPerSecond || '0')
      .mul('86400')
  );

  const isStakeAAVE = mode === 'aave';
  const isStkGho = mode === 'gho';
  const isStkBpt = mode === 'bpt';

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
                <StyledToggleButton value="gho" disabled={mode === 'gho'}>
                  <Typography variant="subheader1">
                    <Trans>Stake GHO</Trans>
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
                  stakeData={stkAave}
                  stakeUserData={stkAaveUserData} // todo change?
                  onStakeAction={() => openStake(Stake.aave, 'AAVE')}
                  onCooldownAction={() => openStakeCooldown(Stake.aave)}
                  onUnstakeAction={() => openUnstake(Stake.aave, 'AAVE')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim(Stake.aave, 'AAVE')}
                  onStakeRewardClaimRestakeAction={() =>
                    openStakeRewardsRestakeClaim(Stake.aave, 'AAVE')
                  }
                >
                  <Box
                    sx={{
                      mt: {
                        xs: '20px',
                        xsm: '36px',
                      },
                      px: {
                        xsm: 6,
                      },
                      width:
                        STAGING_ENV || ENABLE_TESTNET
                          ? {
                              xs: '100%',
                              lg: '50%',
                            }
                          : '100%',
                      marginX: 'auto',
                    }}
                  >
                    <GhoDiscountProgram />
                  </Box>
                </StakingPanel>
              </Grid>
              <Grid
                item
                xs={12}
                lg={6}
                sx={{ display: { xs: !isStkGho ? 'none' : 'block', lg: 'block' } }}
              >
                <StakingPanel
                  stakeTitle="GHO"
                  stakedToken="GHO"
                  maxSlash="0.99" // TODO fetch from contracts
                  icon="gho"
                  stakeData={stkGho}
                  stakeUserData={stkGhoUserData}
                  onStakeAction={() => openStake(Stake.gho, 'GHO')}
                  onCooldownAction={() => openStakeCooldown(Stake.gho)}
                  onUnstakeAction={() => openUnstake(Stake.gho, 'GHO')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim(Stake.gho, 'AAVE')}
                />
              </Grid>

              <Grid
                item
                xs={12}
                lg={6}
                sx={{ display: { xs: !isStkBpt ? 'none' : 'block', lg: 'block' } }}
              >
                <StakingPanel
                  stakeTitle="ABPT V2"
                  stakedToken="ABPTV2"
                  maxSlash="0.3"
                  icon="stkbptv2"
                  stakeData={stkBptV2}
                  stakeUserData={stkBptV2UserData}
                  onStakeAction={() => openStake(Stake.bptv2, 'stkBPT v2')}
                  onCooldownAction={() => openStakeCooldown(Stake.bptv2)}
                  onUnstakeAction={() => openUnstake(Stake.bptv2, 'stkBPT v2')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim(Stake.bptv2, 'AAVE')}
                  headerAction={<GetABPToken />}
                />
              </Grid>

              {/* TODO: Only show v1 panel if user has unclaimed rewards or they have a stk balance */}
              {/* {stkBptUserData?.stakeTokenUserBalance !== '0' && ( */}
              <Grid
                item
                xs={12}
                lg={6}
                sx={{ display: { xs: !isStkBpt ? 'none' : 'block', lg: 'block' } }}
              >
                <StakingPanel
                  stakeTitle="ABPT"
                  stakedToken="ABPT"
                  maxSlash="0.3"
                  icon="stkbpt"
                  stakeData={stkBpt}
                  stakeUserData={stkBptUserData}
                  onStakeAction={() => openStake(Stake.bpt, 'stkBPT')}
                  onCooldownAction={() => openStakeCooldown(Stake.bpt)}
                  onUnstakeAction={() => openUnstake(Stake.bpt, 'stkBPT')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim(Stake.bpt, 'AAVE')}
                  onMigrateAction={() => openStakingMigrate()}
                  headerAction={
                    <Box
                      sx={(theme) => ({
                        backgroundColor: theme.palette.warning.main,
                        borderRadius: 12,
                        height: '16px',
                        width: '84px',
                        marginLeft: 'auto',
                      })}
                    >
                      <Typography sx={{ px: 2 }} color="white" variant="caption">
                        Deprecated
                      </Typography>
                    </Box>
                  }
                  inPostSlashing
                >
                  <Box
                    sx={{
                      mt: 4,
                    }}
                  >
                    <Warning severity="warning" sx={{ mb: 0 }}>
                      <Trans>
                        As a result of governance decisions, the existing ABPT staking pool is now
                        deprecated. You have the flexibility to either migrate all of your tokens to
                        v2 or unstake them without any cooldown period. Learn more
                      </Trans>
                    </Warning>
                  </Box>
                </StakingPanel>
              </Grid>
              {/* )} */}
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
