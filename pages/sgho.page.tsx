import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { SGhoCard } from 'src/modules/sGho/SGhoCard';
import { SGHOHeader } from 'src/modules/sGho/SGhoHeader';
import { YourInfoSidebar } from 'src/modules/sGho/YourInfoSidebar';
import { StkGhoCard } from 'src/modules/stkGho/StkGhoCard';
import { useRootStore } from 'src/store/root';
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
const SGhoVaultDepositModal = dynamic(() =>
  import('../src/components/transactions/SGhoVault/SGhoVaultDepositModal').then(
    (module) => module.SGhoVaultDepositModal
  )
);
const SGhoVaultWithdrawModal = dynamic(() =>
  import('../src/components/transactions/SGhoVault/SGhoVaultWithdrawModal').then(
    (module) => module.SGhoVaultWithdrawModal
  )
);

export default function SavingsGho() {
  const [trackEvent, currentMarket, setCurrentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket, store.setCurrentMarket])
  );
  const { marketKey } = useSavingsMarketData();
  const { currentAccount } = useWeb3Context();
  const isConnected = !!currentAccount;

  // Keep the global currentMarket in sync with the savings target so the rest
  // of the app (wallet network checks, wallet balances, etc.) lines up with
  // the chain our data hooks are querying.
  useEffect(() => {
    if (currentMarket !== marketKey) {
      setCurrentMarket(marketKey);
    }
  }, [currentMarket, marketKey, setCurrentMarket]);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'sGHO',
    });
  }, [trackEvent]);

  return (
    <>
      <SGHOHeader />
      <ContentContainer>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', mdlg: 'row' },
            gap: 4,
            alignItems: 'flex-start',
          }}
        >
          <SGhoCard />
          {isConnected ? <StkGhoCard /> : <YourInfoSidebar />}
        </Box>
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
      <SGhoVaultDepositModal />
      <SGhoVaultWithdrawModal />
      {/** End of modals */}
    </MainLayout>
  );
};
