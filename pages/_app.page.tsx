import '/public/fonts/inter/inter.css';
import '/src/styles/variables.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConnectKitProvider, getDefaultConfig, getDefaultConnectors } from 'connectkit';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactNode, useEffect } from 'react';
import { AddressBlocked } from 'src/components/AddressBlocked';
import { Meta } from 'src/components/Meta';
import { TransactionEventHandler } from 'src/components/TransactionEventHandler';
import { GasStationProvider } from 'src/components/transactions/GasStation/GasStationProvider';
import { BackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextProvider } from 'src/hooks/useModal';
import { ReadOnlyConnector } from 'src/libs/web3-data-provider/ReadOnlyConnector';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { SharedDependenciesProvider } from 'src/ui-config/SharedDependenciesProvider';
import { createConfig, WagmiConfig } from 'wagmi';

import createEmotionCache from '../src/createEmotionCache';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';

const SwapModal = dynamic(() =>
  import('src/components/transactions/Swap/SwapModal').then((mod) => mod.SwapModal)
);
const RateSwitchModal = dynamic(() =>
  import('src/components/transactions/RateSwitch/RateSwitchModal').then(
    (mod) => mod.RateSwitchModal
  )
);
const MigrateV3Modal = dynamic(() =>
  import('src/components/transactions/MigrateV3/MigrateV3Modal').then((mod) => mod.MigrateV3Modal)
);
const BorrowModal = dynamic(() =>
  import('src/components/transactions/Borrow/BorrowModal').then((mod) => mod.BorrowModal)
);
const ClaimRewardsModal = dynamic(() =>
  import('src/components/transactions/ClaimRewards/ClaimRewardsModal').then(
    (mod) => mod.ClaimRewardsModal
  )
);
const CollateralChangeModal = dynamic(() =>
  import('src/components/transactions/CollateralChange/CollateralChangeModal').then(
    (mod) => mod.CollateralChangeModal
  )
);
const DebtSwitchModal = dynamic(() =>
  import('src/components/transactions/DebtSwitch/DebtSwitchModal').then(
    (mod) => mod.DebtSwitchModal
  )
);
const SupplyModal = dynamic(() =>
  import('src/components/transactions/Supply/SupplyModal').then((mod) => mod.SupplyModal)
);
const WithdrawModal = dynamic(() =>
  import('src/components/transactions/Withdraw/WithdrawModal').then((mod) => mod.WithdrawModal)
);
const RepayModal = dynamic(() =>
  import('src/components/transactions/Repay/RepayModal').then((mod) => mod.RepayModal)
);
const EmodeModal = dynamic(() =>
  import('src/components/transactions/Emode/EmodeModal').then((mod) => mod.EmodeModal)
);
const FaucetModal = dynamic(() =>
  import('src/components/transactions/Faucet/FaucetModal').then((mod) => mod.FaucetModal)
);

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

const wagmiConfig = createConfig({
  ...getDefaultConfig({
    connectors: [
      ...getDefaultConnectors({
        app: {
          name: 'Aave',
          description: 'Your App Description',
          url: 'app.aave.com',
          icon: 'https://app.aave.com/favicon.ico',
        },
        walletConnectProjectId: '5e8e618c68a73b7fb035c833dbf210b4',
      }),
      new ReadOnlyConnector(),
    ],
    // Required API Keys
    // alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId: '5e8e618c68a73b7fb035c833dbf210b4', // process.env.WALLETCONNECT_PROJECT_ID,
    // Required
    appName: 'Aave',

    // Optional
    appDescription: 'Your App Description',
    appUrl: 'https://family.co', // your app's url
    appIcon: 'https://family.co/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
});

export const queryClient = new QueryClient();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}
export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page: ReactNode) => page);
  const [initializeMixpanel, setHydrated] = useRootStore((store) => [
    store.initializeMixpanel,
    store.setHydrated,
  ]);

  const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL;
  useEffect(() => {
    if (MIXPANEL_TOKEN) {
      initializeMixpanel();
    } else {
      console.log('no analytics tracking');
    }
  }, [MIXPANEL_TOKEN, initializeMixpanel]);

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

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
        imageUrl="https://app.aave.com/aaveMetaLogo-min.jpg"
      />
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiConfig config={wagmiConfig}>
            <ConnectKitProvider
              customTheme={{
                '--ck-body-background': '#292E41', // paper, dark
                '--ck-primary-button-background': '#383D51', // surface, dark
                '--ck-primary-button-hover-background': 'rgba(56, 61, 81, 0.6)',
                '--ck-secondary-button-background': '#383D51', // surface, dark
                '--ck-secondary-button-hover-background': 'rgba(56, 61, 81, 0.6)',
                '--ck-tooltip-background': '#383D51', // surface, dark
                '--ck-tooltip-color': '#8E92A3', // text muted, dark
                '--ck-body-divider': '#EBEBEF14', // divider, dark
                '--ck-qr-border-color': '#EBEBEF14', // divider, dark
                '--ck-body-action-color': '#FFFFFF',
                '--ck-body-background-secondary': '#383D51', // surface, dark
                '--ck-primary-button-border-radius': '4px',
                '--ck-border-radius': '4px',
                '--ck-spinner-color': '#B6509E',
              }}
            >
              <Web3ContextProvider>
                <AppGlobalStyles>
                  <AddressBlocked>
                    <ModalContextProvider>
                      <BackgroundDataProvider>
                        <AppDataProvider>
                          <GasStationProvider>
                            <SharedDependenciesProvider>
                              {getLayout(<Component {...pageProps} />)}
                              <SupplyModal />
                              <WithdrawModal />
                              <BorrowModal />
                              <RepayModal />
                              <CollateralChangeModal />
                              <RateSwitchModal />
                              <DebtSwitchModal />
                              <ClaimRewardsModal />
                              <EmodeModal />
                              <SwapModal />
                              <FaucetModal />
                              <MigrateV3Modal />
                              <TransactionEventHandler />
                            </SharedDependenciesProvider>
                          </GasStationProvider>
                        </AppDataProvider>
                      </BackgroundDataProvider>
                    </ModalContextProvider>
                  </AddressBlocked>
                </AppGlobalStyles>
              </Web3ContextProvider>
            </ConnectKitProvider>
          </WagmiConfig>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </LanguageProvider>
    </CacheProvider>
  );
}
