import Container from '@mui/material/Container';

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardContentWrapper } from '../src/modules/dashboard/DashboardContentWrapper';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';

export default function Home() {
  const { currentAccount } = useWeb3Context();

  // TODO: need for adaptive
  // const [isBorrow, setIsBorrow] = useState(false);

  return (
    <Container maxWidth="xl">
      <DashboardTopPanel />

      {currentAccount ? <DashboardContentWrapper isBorrow={true} /> : <ConnectWalletPaper />}
    </Container>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
