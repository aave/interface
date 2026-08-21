import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { usePinnedMarket } from 'src/hooks/usePinnedMarket';
import { MainLayout } from 'src/layouts/MainLayout';
import { UmbrellaAssetsListContainer } from 'src/modules/umbrella/StakeAssets/UmbrellaAssetsListContainer';
import { UmrellaAssetsDefaultListContainer } from 'src/modules/umbrella/UmbrellaAssetsDefault';
import { UmbrellaHeader } from 'src/modules/umbrella/UmbrellaHeader';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';

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
  import('../src/modules/umbrella/UnstakeModal').then((module) => module.UnStakeModal)
);
const UmbrellaClaimModal = dynamic(() =>
  import('../src/modules/umbrella/UmbrellaClaimModal').then((module) => module.UmbrellaClaimModal)
);

export default function UmbrellaStaking() {
  const { currentAccount } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Staking',
    });
  }, [trackEvent]);

  // Staking always runs on the Core instance (pinned for the page, restored on unmount).
  usePinnedMarket(CustomMarket.proto_mainnet_v3);

  return (
    <>
      <UmbrellaHeader />
      <ContentContainer>
        {currentAccount ? <UmbrellaAssetsListContainer /> : <UmrellaAssetsDefaultListContainer />}
      </ContentContainer>
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
      <UmbrellaClaimModal />
      {/** End of modals */}
    </MainLayout>
  );
};
