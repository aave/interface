import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ROUTES } from 'src/components/primitives/Link';

import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';

export default function Home() {
  const router = useRouter();
  const { currentAccount } = useWeb3Context();

  // Redirect based on wallet connection status
  useEffect(() => {
    if (currentAccount) {
      // If wallet is connected, go to dashboard
      router.replace(ROUTES.dashboard);
    } else {
      // If no wallet connected, go to markets
      router.replace(ROUTES.markets);
    }
  }, [currentAccount, router]);

  // Don't render anything since we're redirecting
  return null;
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
