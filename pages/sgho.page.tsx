import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { SGHOHeader } from 'src/modules/sGho/SGhoHeader';
import { StkGhoCard } from 'src/modules/stkGho/StkGhoCard';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { useShallow } from 'zustand/shallow';

const SavingsGhoDepositModal = dynamic(() =>
  import('../src/components/transactions/SavingsGho/SavingsGhoDepositModal').then(
    (module) => module.SavingsGhoDepositModal
  )
);
const SavingsGhoWithdrawModal = dynamic(() =>
  import('../src/components/transactions/SavingsGho/SavingsGhoWithdrawModal').then(
    (module) => module.SavingsGhoWithdrawModal
  )
);
const StakeRewardClaimModal = dynamic(() =>
  import('../src/components/transactions/StakeRewardClaim/StakeRewardClaimModal').then(
    (module) => module.StakeRewardClaimModal
  )
);

export default function SavingsGho() {
  const [trackEvent, currentMarket, setCurrentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket, store.setCurrentMarket])
  );

  // Automatically switch to mainnet if not already on mainnet
  // since sGHO only exists on Ethereum mainnet
  useEffect(() => {
    if (currentMarket !== CustomMarket.proto_mainnet_v3) {
      setCurrentMarket(CustomMarket.proto_mainnet_v3);
    }
  }, [currentMarket, setCurrentMarket]);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'sGHO',
    });
  }, [trackEvent]);

  return (
    <>
      <SGHOHeader />
      <ContentContainer>
        <StkGhoCard />
      </ContentContainer>
    </>
  );
}

SavingsGho.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      {/** Modals */}
      <SavingsGhoDepositModal />
      <SavingsGhoWithdrawModal />
      <StakeRewardClaimModal />
      {/** End of modals */}
    </MainLayout>
  );
};
