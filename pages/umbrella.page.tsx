// import { StakeUIUserData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { Trans } from '@lingui/macro';
import { Box, Container } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatEther } from 'ethers/lib/utils';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
// import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { MainLayout } from 'src/layouts/MainLayout';
import { UmbrellaAssetsListContainer } from 'src/modules/umbrella/StakeAssets/UmbrellaAssetsListContainer';
import { UmbrellaHeader } from 'src/modules/umbrella/UmbrellaHeader';
// import { UmbrellaStakedAssetsListContainer } from 'src/modules/umbrella/UserStakedAssets/UmbrellaStakedAssetsListContainer';
import { useRootStore } from 'src/store/root';

import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';

const UmbrellaStakeModal = dynamic(() =>
  import('../src/modules/umbrella/UmbrellaModal').then((module) => module.UmbrellaModal)
);
const StakeCooldownModal = dynamic(() =>
  import('../src/modules/umbrella/StakeCooldownModal').then((module) => module.StakeCooldownModal)
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
interface MarketContainerProps {
  children: ReactNode;
}
export const marketContainerProps = {
  sx: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    pb: '39px',
    px: {
      xs: 2,
      xsm: 5,
      sm: 12,
      md: 5,
      lg: 0,
      xl: '96px',
      xxl: 0,
    },
    maxWidth: {
      xs: 'unset',
      lg: '1240px',
      xl: 'unset',
      xxl: '1440px',
    },
  },
};
export const MarketContainer = ({ children }: MarketContainerProps) => {
  return <Container {...marketContainerProps}>{children}</Container>;
};

// TODO: Hooks for staking tokens
// TODO: Hooks for user positions for top panel
export default function UmbrellaStaking() {
  const { currentAccount } = useWeb3Context();

  const currentMarketData = useRootStore((store) => store.currentMarketData);
  // const { data: stakeUserResult } = useUserStakeUiData(currentMarketData);

  const { data: stakeGeneralResult, isLoading: stakeGeneralResultLoading } =
    useGeneralStakeUiData(currentMarketData);

  let stkAave: StakeTokenFormatted | undefined;
  let stkBpt: StakeTokenFormatted | undefined;
  let stkGho: StakeTokenFormatted | undefined;
  let stkBptV2: StakeTokenFormatted | undefined;

  if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
    [stkAave, stkBpt, stkGho, stkBptV2] = stakeGeneralResult;
  }

  // let stkAaveUserData: StakeUIUserData | undefined;
  // let stkBptUserData: StakeUIUserData | undefined;
  // let stkGhoUserData: StakeUIUserData | undefined;
  // let stkBptV2UserData: StakeUIUserData | undefined;
  // if (stakeUserResult && Array.isArray(stakeUserResult)) {
  //   [stkAaveUserData, stkBptUserData, stkGhoUserData, stkBptV2UserData] = stakeUserResult;
  // }

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

  if (!currentAccount) {
    return (
      <ConnectWalletPaper
        description={
          <Trans>
            We couldn’t detect a wallet. Connect a wallet to view your staking positions and
            rewards.
          </Trans>
        }
      />
    );
  }

  return (
    <>
      <UmbrellaHeader stkEmission={stkEmission} loading={stakeGeneralResultLoading} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          mt: { xs: '-32px', lg: '-46px', xl: '-44px', xxl: '-48px' },
        }}
      >
        <MarketContainer>
          <h2 style={{ color: 'white' }}> TODO but can reuse most of existing</h2>
          {/* <UmbrellaStakedAssetsListContainer /> */}
        </MarketContainer>
        <MarketContainer>
          <UmbrellaAssetsListContainer />
        </MarketContainer>
      </Box>
    </>
  );
}

UmbrellaStaking.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      {/** Modals */}
      <UmbrellaStakeModal />
      <StakeCooldownModal />
      <UnStakeModal />
      <StakeRewardClaimModal />
      <StakeRewardClaimRestakeModal />
      {/** End of modals */}
    </MainLayout>
  );
};
