import Container from '@mui/material/Container';
import * as React from 'react';

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { useAppDataContext } from '../src/hooks/app-data-provider/useAppDataProvider';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardTopPanel } from '../src/modules/dashboard/components/DashboardTopPanel';

export default function Home() {
  const { currentAccount } = useWeb3Context();
  const { user } = useAppDataContext();

  return (
    <Container maxWidth="lg">
      <DashboardTopPanel user={user} currentAccount={currentAccount} />

      {!currentAccount && <ConnectWalletPaper />}
    </Container>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
