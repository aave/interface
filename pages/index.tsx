import Container from '@mui/material/Container';
import * as React from 'react';
import { SupplyModal } from '../src/components/Supply/SupplyModal';
import { useWalletBalances } from '../src/hooks/app-data-provider/useWalletBalances';

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { useAppDataContext } from '../src/hooks/app-data-provider/useAppDataProvider';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';
import { Box } from '@mui/material';

export default function Home() {
  // const { currentMarket } = useProtocolDataContext();
  const { walletBalances } = useWalletBalances();
  const { reserves, user } = useAppDataContext();
  const { currentAccount } = useWeb3Context();
  const [supply, setSupply] = React.useState<string>('');

  return (
    <Container maxWidth="lg">
      <DashboardTopPanel user={user} currentAccount={currentAccount} />
      {currentAccount ? (
        <Box sx={{ pt: 100 }}>
          {reserves.map((reserve, index) => {
            return (
              <div key={index} onClick={() => setSupply(reserve.underlyingAsset)}>
                {reserve.symbol} {walletBalances[reserve.underlyingAsset]?.amountUSD}
              </div>
            );
          })}
        </Box>
      ) : (
        <ConnectWalletPaper />
      )}
      <SupplyModal underlyingAsset={supply} handleClose={() => setSupply('')} open={!!supply} />
    </Container>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
