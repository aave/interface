import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import Dashboard from './dashboard.page';
import Markets from './markets.page';

export default function Home() {
  const { currentAccount } = useWeb3Context();

  // Show dashboard if wallet is connected, otherwise show markets
  return currentAccount ? <Dashboard /> : <Markets />;
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
