import Container from '@mui/material/Container';
import * as React from 'react';
import { Supply } from '../src/components/Supply/Supply';
import { useWalletBalances } from '../src/hooks/app-data-provider/useWalletBalances';

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { useAppDataContext } from '../src/hooks/app-data-provider/useAppDataProvider';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';
import { Box } from '@mui/material';
import { ComputedUserReserve } from '@aave/math-utils';

export default function Home() {
  // const { currentMarket } = useProtocolDataContext();
  const { walletBalances } = useWalletBalances();
  const { reserves, user } = useAppDataContext();
  const { currentAccount } = useWeb3Context();

  return (
    <Container maxWidth="lg">
      <DashboardTopPanel user={user} currentAccount={currentAccount} />
      {currentAccount ? (
        <Box>
          {reserves.map((reserve, index) => {
            const userReserves = user?.userReservesData.filter(
              (userReserve) => reserve.underlyingAsset === userReserve.underlyingAsset
            );
            return (
              <div key={index}>
                {reserve.symbol} {walletBalances[reserve.underlyingAsset]?.amountUSD}
                {user && (
                  <Supply
                    poolReserve={reserve}
                    userReserve={userReserves ? userReserves[0] : ({} as ComputedUserReserve)}
                    walletBalance={walletBalances[reserve.underlyingAsset]?.amount}
                    user={user}
                    supplyApy={reserve.supplyAPY}
                  />
                )}
              </div>
            );
          })}
        </Box>
      ) : (
        <ConnectWalletPaper />
      )}
    </Container>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
