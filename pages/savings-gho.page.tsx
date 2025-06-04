import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { SavingsGhoTopPanel } from 'src/modules/savings-gho/SavingsGhoTopPanel';
import { SavingsGhoWrapper } from 'src/modules/savings-gho/SavingsGhoWrapper';
import { useRootStore } from 'src/store/root';

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
const StakeCooldownModal = dynamic(() =>
  import('../src/components/transactions/StakeCooldown/StakeCooldownModal').then(
    (module) => module.StakeCooldownModal
  )
);

export default function SavingsGho() {
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Savings GHO',
    });
  }, [trackEvent]);

  return (
    <>
      <SavingsGhoTopPanel />
      <ContentContainer>
        <SavingsGhoWrapper />
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
      <StakeCooldownModal />
      {/** End of modals */}
    </MainLayout>
  );
};
