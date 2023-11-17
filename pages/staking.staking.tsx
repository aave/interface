import { Trans } from '@lingui/macro';
import { Box, Grid } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ConnectWalletPaperStaking } from 'src/components/ConnectWalletPaperStaking';
import { ContentContainer } from 'src/components/ContentContainer';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { MainLayout } from 'src/layouts/MainLayout';
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
    openStakingMigrate,
  } = useModalContext();

  // const [mode, setMode] = useState<'aave' | 'bpt' | ''>('aave');

  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Staking',
    });
  }, [trackEvent]);

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

  return (
    <>
      <StakingHeader tvl={tvl} stkEmission={stkEmission} loading={stakeDataLoading} />

      <ContentContainer>
        {currentAccount ? (
          <Grid container spacing={4}>
            <Grid
              item
              xs={12}
              lg={STAGING_ENV || ENABLE_TESTNET ? 12 : 6}
              sx={{ display: 'block' }}
            >
              <StakingPanel
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
                onStakeRewardClaimRestakeAction={() => openStakeRewardsRestakeClaim('aave', 'AAVE')}
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
            <Grid item xs={12} lg={6} sx={{ display: 'block' }}>
              <StakingPanel
                stakedToken="ABPTV2"
                maxSlash="0.3"
                icon="stkbpt"
                stakeData={stakeGeneralResult?.bptV2}
                stakeUserData={stakeUserResult?.bptV2}
                ethPriceUsd={stakeGeneralResult?.ethPriceUsd}
                onStakeAction={() => openStake('bpt', 'stkBPT')}
                onCooldownAction={() => openStakeCooldown('bpt')}
                onUnstakeAction={() => openUnstake('bpt', 'stkBPT')}
                onStakeRewardClaimAction={() => openStakeRewardsClaim('bpt', 'AAVE')}
              />
            </Grid>
            <Grid item xs={12} lg={6} sx={{ display: 'block' }}>
              <StakingPanel
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
                onMigrateAction={() => openStakingMigrate()}
                inPostSlashing
              />
            </Grid>
          </Grid>
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
