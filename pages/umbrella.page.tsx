// import { StakeUIUserData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { Trans } from '@lingui/macro';
import { Box, Container } from '@mui/material';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
// import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { MainLayout } from 'src/layouts/MainLayout';
import { UmbrellaAssetsListContainer } from 'src/modules/umbrella/StakeAssets/UmbrellaAssetsListContainer';
import { UmbrellaHeader } from 'src/modules/umbrella/UmbrellaHeader';

// import { UmbrellaStakedAssetsListContainer } from 'src/modules/umbrella/UserStakedAssets/UmbrellaStakedAssetsListContainer';
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
      <UmbrellaHeader />
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
