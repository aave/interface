import { Stake } from '@aave/contract-helpers';
import { StakeUIUserData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, Grid, Stack, SvgIcon, Typography } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatEther } from 'ethers/lib/utils';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { ConnectWalletPaperStaking } from 'src/components/ConnectWalletPaperStaking';
import { ContentContainer } from 'src/components/ContentContainer';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { MainLayout } from 'src/layouts/MainLayout';
import { GetABPToken } from 'src/modules/staking/GetABPToken';
import { GhoDiscountProgram } from 'src/modules/staking/GhoDiscountProgram';
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
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData);

  const { data: stakeGeneralResult, isLoading: stakeGeneralResultLoading } =
    useGeneralStakeUiData(currentMarketData);

  let stkAave: StakeTokenFormatted | undefined;
  let stkBpt: StakeTokenFormatted | undefined;
  let stkGho: StakeTokenFormatted | undefined;
  let stkBptV2: StakeTokenFormatted | undefined;

  if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
    [stkAave, stkBpt, stkGho, stkBptV2] = stakeGeneralResult;
  }

  let stkAaveUserData: StakeUIUserData | undefined;
  let stkBptUserData: StakeUIUserData | undefined;
  let stkGhoUserData: StakeUIUserData | undefined;
  let stkBptV2UserData: StakeUIUserData | undefined;
  if (stakeUserResult && Array.isArray(stakeUserResult)) {
    [stkAaveUserData, stkBptUserData, stkGhoUserData, stkBptV2UserData] = stakeUserResult;
  }

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

  const tvl = {
    'Staked Aave': Number(stkAave?.totalSupplyUSDFormatted || '0'),
    'Staked GHO': Number(stkGho?.totalSupplyUSDFormatted || '0'),
    'Staked ABPT': Number(stkBpt?.totalSupplyUSDFormatted || '0'),
    'Staked ABPT V2': Number(stkBptV2?.totalSupplyUSDFormatted || '0'),
  };

  // Total AAVE Emissions (stkaave dps + stkbpt dps)
  const stkEmission = formatEther(
    BigNumber.from(stkAave?.distributionPerSecond || '0')
      .add(stkBpt?.distributionPerSecond || '0')
      .add(stkGho?.distributionPerSecond || '0')
      .add(stkBptV2?.distributionPerSecond || '0')
      .mul('86400')
  );

  const isStakeAAVE = mode === 'aave';
  const isStkGho = mode === 'gho';
  const isStkBpt = mode === 'bpt';

  const showAbptPanel =
    !stkBpt?.inPostSlashingPeriod ||
    stkBptUserData?.stakeTokenUserBalance !== '0' ||
    stkBptUserData.userIncentivesToClaim !== '0' ||
    stkBptUserData.underlyingTokenUserBalance !== '0';

  return (
    <>
      <StakingHeader tvl={tvl} stkEmission={stkEmission} loading={stakeGeneralResultLoading} />

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
                  maxSlash={stkAave?.maxSlashablePercentageFormatted || '0'}
                  icon="aave"
                  stakeData={stkAave}
                  stakeUserData={stkAaveUserData}
                  onStakeAction={() => openStake(Stake.aave, 'AAVE')}
                  onCooldownAction={() => openStakeCooldown(Stake.aave, 'AAVE')}
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
                  maxSlash={stkGho?.maxSlashablePercentageFormatted || '0'}
                  icon="gho"
                  stakeData={stkGho}
                  stakeUserData={stkGhoUserData}
                  onStakeAction={() => openStake(Stake.gho, 'GHO')}
                  onCooldownAction={() => openStakeCooldown(Stake.gho, 'GHO')}
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
                  maxSlash={stkBptV2?.maxSlashablePercentageFormatted || '0'}
                  icon="stkbptv2"
                  stakeData={stkBptV2}
                  stakeUserData={stkBptV2UserData}
                  onStakeAction={() => openStake(Stake.bptv2, 'stkbptv2')}
                  onCooldownAction={() => openStakeCooldown(Stake.bptv2, 'stkbptv2')}
                  onUnstakeAction={() => openUnstake(Stake.bptv2, 'stkbptv2')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim(Stake.bptv2, 'AAVE')}
                  headerAction={<GetABPToken />}
                />
              </Grid>

              <Grid
                item
                xs={12}
                lg={6}
                sx={{ display: { xs: !isStkBpt ? 'none' : 'block', lg: 'block' } }}
              >
                {showAbptPanel && (
                  <StakingPanel
                    stakeTitle="ABPT"
                    stakedToken="ABPT"
                    maxSlash={stkBpt?.maxSlashablePercentageFormatted || '0'}
                    icon="stkbpt"
                    stakeData={stkBpt}
                    stakeUserData={stkBptUserData}
                    onStakeAction={() => openStake(Stake.bpt, 'stkBPT')}
                    onCooldownAction={() => openStakeCooldown(Stake.bpt, 'stkbpt')}
                    onUnstakeAction={() => openUnstake(Stake.bpt, 'stkBPT')}
                    onStakeRewardClaimAction={() => openStakeRewardsClaim(Stake.bpt, 'AAVE')}
                    onMigrateAction={() => openStakingMigrate()}
                    headerAction={
                      stkBpt?.inPostSlashingPeriod ? (
                        <Stack direction="row" alignItems="center" gap={3}>
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
                          <Button
                            variant="outlined"
                            size="small"
                            component={Link}
                            endIcon={
                              <SvgIcon sx={{ width: 14, height: 14 }}>
                                <ExternalLinkIcon />
                              </SvgIcon>
                            }
                            href="https://pools.balancer.exchange/#/pool/0xc697051d1c6296c24ae3bcef39aca743861d9a81/"
                          >
                            <Trans>Balancer Pool</Trans>
                          </Button>
                        </Stack>
                      ) : null
                    }
                  >
                    {stkBpt?.inPostSlashingPeriod && (
                      <Box
                        sx={{
                          mt: 4,
                        }}
                      >
                        <Warning severity="warning" sx={{ mb: 0 }}>
                          <Trans>
                            As a result of governance decisions, this ABPT staking pool is now
                            deprecated. You have the flexibility to either migrate all of your
                            tokens to v2 or unstake them without any cooldown period.
                          </Trans>
                        </Warning>
                      </Box>
                    )}
                  </StakingPanel>
                )}
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
