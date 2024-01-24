import { Trans } from '@lingui/macro';
import { Box, Grid, Typography } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { ConnectWalletPaperStaking } from 'src/components/ConnectWalletPaperStaking';
import { ContentContainer } from 'src/components/ContentContainer';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { MainLayout } from 'src/layouts/MainLayout';
import { BuyWithFiat } from 'src/modules/staking/BuyWithFiat';
import { GetABPToken } from 'src/modules/staking/GetABPToken';
// import { GetGhoToken } from 'src/modules/staking/GetGhoToken';
import { StakingHeader } from 'src/modules/staking/StakingHeader';
import { StakingPanel } from 'src/modules/staking/StakingPanel';
import { useRootStore } from 'src/store/root';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { ENABLE_TESTNET, getNetworkConfig, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';

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
  const { currentAccount, loading, chainId } = useWeb3Context();

  const {
    tokens: {
      aave: { TOKEN_STAKING: STK_AAVE, TOKEN_ORACLE: STK_AAVE_ORACLE },
      bpt: { TOKEN_STAKING: STK_BPT, TOKEN_ORACLE: STK_BPT_ORACLE },
      gho: { TOKEN_STAKING: STK_GHO, TOKEN_ORACLE: STK_GHO_ORACLE },
    },
  } = stakeConfig;

  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stakeUserResult, isLoading: stakeUserResultLoading } = useUserStakeUiData(
    currentMarketData,
    [STK_AAVE, STK_BPT, STK_GHO],
    [STK_AAVE_ORACLE, STK_BPT_ORACLE, STK_GHO_ORACLE]
  );

  const { data: stakeGeneralResult, isLoading: stakeGeneralResultLoading } = useGeneralStakeUiData(
    currentMarketData,
    [STK_AAVE, STK_BPT, STK_GHO],
    [STK_AAVE_ORACLE, STK_BPT_ORACLE, STK_GHO_ORACLE]
  );

  let stkAave, stkBpt, stkGho;

  if (stakeGeneralResult && Array.isArray(stakeGeneralResult.stakeData)) {
    [stkAave, stkBpt, stkGho] = stakeGeneralResult.stakeData;
  }

  let stkAaveUserData, stkBptUserData, stkGhoUserData;
  if (stakeUserResult && Array.isArray(stakeUserResult.stakeUserData)) {
    [stkAaveUserData, stkBptUserData, stkGhoUserData] = stakeUserResult.stakeUserData;
  }

  const stakeDataLoading = stakeUserResultLoading || stakeGeneralResultLoading;

  const {
    openStake,
    openStakeCooldown,
    openUnstake,
    openStakeRewardsClaim,
    openStakeRewardsRestakeClaim,
  } = useModalContext();

  const [mode, setMode] = useState<'aave' | 'bpt' | 'gho'>('aave');

  const { name: network } = getNetworkConfig(chainId);
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
                <StyledToggleButton value="gho" disabled={mode === 'gho'}>
                  <Typography variant="subheader1">
                    <Trans>Stake GHO</Trans>
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
                  onStakeAction={() => openStake('aave', 'AAVE')}
                  onCooldownAction={() => openStakeCooldown('aave')}
                  onUnstakeAction={() => openUnstake('aave', 'AAVE')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim('aave', 'AAVE')}
                  onStakeRewardClaimRestakeAction={() =>
                    openStakeRewardsRestakeClaim('aave', 'AAVE')
                  }
                  headerAction={<BuyWithFiat cryptoSymbol="AAVE" networkMarketName={network} />}
                  hasDiscountProgram={true}
                />
              </Grid>
              <Grid
                item
                xs={12}
                lg={6}
                sx={{ display: { xs: isStakeAAVE ? 'none' : 'block', lg: 'block' } }}
              >
                <StakingPanel
                  stakeTitle="GHO"
                  stakedToken="GHO"
                  maxSlash="1" // 100%
                  icon="gho"
                  stakeData={stkGho}
                  stakeUserData={stkGhoUserData}
                  ethPriceUsd={stakeGeneralResult?.ethPriceUsd}
                  onStakeAction={() => openStake('gho', 'GHO')}
                  onCooldownAction={() => openStakeCooldown('gho')}
                  onUnstakeAction={() => openUnstake('gho', 'GHO')}
                  onStakeRewardClaimAction={() => openStakeRewardsClaim('gho', 'AAVE')}
                  // headerAction={<GetGhoToken />}
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
                  stakeData={stkBpt}
                  stakeUserData={stkBptUserData}
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
