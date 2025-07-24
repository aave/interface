import { useEffect } from 'react';

import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { useRootStore } from '../src/store/root';
import Dashboard from './dashboard.page';
import Markets from './markets.page';

export default function Home() {
  const { currentAccount } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Home',
      'Wallet Connected': !!currentAccount,
      'Connection Status': currentAccount ? 'Connected' : 'Unconnected',
    });
  }, [trackEvent, currentAccount]);

  // Show dashboard if wallet is connected, otherwise show markets
  return currentAccount ? <Dashboard /> : <Markets />;
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
