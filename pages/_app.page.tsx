import '/public/fonts/inter/inter.css';
import '/src/styles/variables.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ReactNode, useEffect } from 'react';
import { AddressBlocked } from 'src/components/AddressBlocked';
import { Meta } from 'src/components/Meta';
import { TransactionEventHandler } from 'src/components/TransactionEventHandler';
import { BorrowModal } from 'src/components/transactions/Borrow/BorrowModal';
import { ClaimRewardsModal } from 'src/components/transactions/ClaimRewards/ClaimRewardsModal';
import { CollateralChangeModal } from 'src/components/transactions/CollateralChange/CollateralChangeModal';
import { DebtSwitchModal } from 'src/components/transactions/DebtSwitch/DebtSwitchModal';
import { EmodeModal } from 'src/components/transactions/Emode/EmodeModal';
import { FaucetModal } from 'src/components/transactions/Faucet/FaucetModal';
import { GasStationProvider } from 'src/components/transactions/GasStation/GasStationProvider';
import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { RateSwitchModal } from 'src/components/transactions/RateSwitch/RateSwitchModal';
import { RepayModal } from 'src/components/transactions/Repay/RepayModal';
import { SupplyModal } from 'src/components/transactions/Supply/SupplyModal';
import { SwapModal } from 'src/components/transactions/Swap/SwapModal';
import { WithdrawModal } from 'src/components/transactions/Withdraw/WithdrawModal';
import { BackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextProvider } from 'src/hooks/useModal';
import { PermissionProvider } from 'src/hooks/usePermissions';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { SharedDependenciesProvider } from 'src/ui-config/SharedDependenciesProvider';
import { createConfig, WagmiConfig } from 'wagmi';

// import { publicProvider } from 'wagmi/providers/public';
import createEmotionCache from '../src/createEmotionCache';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

// const { publicClient, webSocketPublicClient } = configureChains([mainnet], [publicProvider()]);
// const wagmiConfig = createConfig({
//   autoConnect: true,
//   publicClient,
//   webSocketPublicClient,
// });
const wagmiConfig = createConfig(
  getDefaultConfig({
    // Required API Keys
    // alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId: '5e8e618c68a73b7fb035c833dbf210b4', // process.env.WALLETCONNECT_PROJECT_ID,
    // Required
    appName: 'Your App Name',

    // Optional
    appDescription: 'Your App Description',
    appUrl: 'https://family.co', // your app's url
    appIcon: 'https://family.co/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

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
            <ConnectKitProvider>
              <Web3ContextProvider>
                <AppGlobalStyles>
                  <AddressBlocked>
                    <PermissionProvider>
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
                    </PermissionProvider>
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
