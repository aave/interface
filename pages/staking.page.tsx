import { Trans } from '@lingui/macro';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { MainLayout } from 'src/layouts/MainLayout';
import { UmbrellaAssetsListContainer } from 'src/modules/umbrella/StakeAssets/UmbrellaAssetsListContainer';
import { UmrellaAssetsDefaultListContainer } from 'src/modules/umbrella/UmbrellaAssetsDefault';
import { UmbrellaHeader } from 'src/modules/umbrella/UmbrellaHeader';
import { isUmbrellaAvailable } from 'src/services/UmbrellaStakeDataService';
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

  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const stakingAvailable = isUmbrellaAvailable(currentMarketData.market);

  return (
    <>
      <UmbrellaHeader hideStats={!stakingAvailable} />
      <ContentContainer>
        {!stakingAvailable ? (
          <EmptyStatePaper
            title={<Trans>Staking is not available on this market</Trans>}
            description={<Trans>Switch to a market that supports staking to continue.</Trans>}
          />
        ) : currentAccount ? (
          <UmbrellaAssetsListContainer />
        ) : (
          <UmrellaAssetsDefaultListContainer />
        )}
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
