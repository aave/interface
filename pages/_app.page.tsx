import '/public/fonts/inter/inter.css';
import '/src/styles/variables.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import { NoSsr } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConnectKitProvider } from 'connectkit';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { ReactNode, useEffect, useState } from 'react';
import { AddressBlocked } from 'src/components/AddressBlocked';
import { Meta } from 'src/components/Meta';
import { TransactionEventHandler } from 'src/components/TransactionEventHandler';
import { GasStationProvider } from 'src/components/transactions/GasStation/GasStationProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextProvider } from 'src/hooks/useModal';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { SharedDependenciesProvider } from 'src/ui-config/SharedDependenciesProvider';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { WagmiProvider } from 'wagmi';

import createEmotionCache from '../src/createEmotionCache';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';

if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    //const whyDidYouRender = require('@welldone-software/why-did-you-render');
    import('@welldone-software/why-did-you-render').then((module) => {
      module.default(React, {
        trackAllPureComponents: true,
      });
    });
    // console.log(whyDidYouRender);
    // whyDidYouRender(React, {
    //   trackAllPureComponents: true
    // });
  }
}

const SwitchModal = dynamic(() =>
  import('src/components/transactions/Switch/SwitchModal').then((module) => module.SwitchModal)
);

const BridgeModal = dynamic(() =>
  import('src/components/transactions/Bridge/BridgeModal').then((module) => module.BridgeModal)
);

const BorrowModal = dynamic(() =>
  import('src/components/transactions/Borrow/BorrowModal').then((module) => module.BorrowModal)
);
const ClaimRewardsModal = dynamic(() =>
  import('src/components/transactions/ClaimRewards/ClaimRewardsModal').then(
    (module) => module.ClaimRewardsModal
  )
);
const CollateralChangeModal = dynamic(() =>
  import('src/components/transactions/CollateralChange/CollateralChangeModal').then(
    (module) => module.CollateralChangeModal
  )
);
const DebtSwitchModal = dynamic(() =>
  import('src/components/transactions/DebtSwitch/DebtSwitchModal').then(
    (module) => module.DebtSwitchModal
  )
);
const EmodeModal = dynamic(() =>
  import('src/components/transactions/Emode/EmodeModal').then((module) => module.EmodeModal)
);
const FaucetModal = dynamic(() =>
  import('src/components/transactions/Faucet/FaucetModal').then((module) => module.FaucetModal)
);
const RepayModal = dynamic(() =>
  import('src/components/transactions/Repay/RepayModal').then((module) => module.RepayModal)
);
const SupplyModal = dynamic(() =>
  import('src/components/transactions/Supply/SupplyModal').then((module) => module.SupplyModal)
);
const SwapModal = dynamic(() =>
  import('src/components/transactions/Swap/SwapModal').then((module) => module.SwapModal)
);
const WithdrawModal = dynamic(() =>
  import('src/components/transactions/Withdraw/WithdrawModal').then(
    (module) => module.WithdrawModal
  )
);
const StakingMigrateModal = dynamic(() =>
  import('src/components/transactions/StakingMigrate/StakingMigrateModal').then(
    (module) => module.StakingMigrateModal
  )
);
const ReadOnlyModal = dynamic(() =>
  import('src/components/WalletConnection/ReadOnlyModal').then((module) => module.ReadOnlyModal)
);

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}
export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page: ReactNode) => page);
  const [initializeMixpanel, setWalletType] = useRootStore((store) => [
    store.initializeMixpanel,
    store.setWalletType,
  ]);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL;
  useEffect(() => {
    if (MIXPANEL_TOKEN) {
      initializeMixpanel();
    } else {
      console.log('no analytics tracking');
    }
  }, []);

  const cleanLocalStorage = () => {
    localStorage.removeItem('readOnlyModeAddress');
  };

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'Open Source Liquidity Protocol'}
        description={
          'Aave is an Open Source Protocol to create Non-Custodial Liquidity Markets to earn interest on supplying and borrowing assets with a variable or stable interest rate. The protocol is designed for easy integration into your products and services.'
        }
        imageUrl="https://app.aave.com/aave-com-opengraph.png"
      />
      <NoSsr>
        <LanguageProvider>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <ConnectKitProvider
                onDisconnect={cleanLocalStorage}
                onConnect={({ connectorId }) => setWalletType(connectorId)}
              >
                <Web3ContextProvider>
                  <AppGlobalStyles>
                    <AddressBlocked>
                      <ModalContextProvider>
                        <SharedDependenciesProvider>
                          <AppDataProvider>
                            <GasStationProvider>
                              {getLayout(<Component {...pageProps} />)}
                              <SupplyModal />
                              <WithdrawModal />
                              <BorrowModal />
                              <RepayModal />
                              <CollateralChangeModal />
                              <DebtSwitchModal />
                              <ClaimRewardsModal />
                              <EmodeModal />
                              <SwapModal />
                              <FaucetModal />
                              <TransactionEventHandler />
                              <SwitchModal />
                              <StakingMigrateModal />
                              <BridgeModal />
                              <ReadOnlyModal />
                            </GasStationProvider>
                          </AppDataProvider>
                        </SharedDependenciesProvider>
                      </ModalContextProvider>
                    </AddressBlocked>
                  </AppGlobalStyles>
                </Web3ContextProvider>
              </ConnectKitProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </WagmiProvider>
        </LanguageProvider>
      </NoSsr>
    </CacheProvider>
  );
}
