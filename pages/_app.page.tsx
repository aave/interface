import '/public/fonts/inter/inter.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import mixpanel from 'mixpanel-browser';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import { AddressBlocked } from 'src/components/AddressBlocked';
import { Meta } from 'src/components/Meta';
import { TransactionEventHandler } from 'src/components/TransactionEventHandler';
import { BorrowModal } from 'src/components/transactions/Borrow/BorrowModal';
import { ClaimRewardsModal } from 'src/components/transactions/ClaimRewards/ClaimRewardsModal';
import { CollateralChangeModal } from 'src/components/transactions/CollateralChange/CollateralChangeModal';
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
import { SharedDependenciesProvider } from 'src/ui-config/SharedDependenciesProvider';

import createEmotionCache from '../src/createEmotionCache';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';
import { MIXPANEL_API_HOST } from '../src/store/analyticsSlice';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWeb3Library(provider: any): providers.Web3Provider {
  const library = new providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export const queryClient = new QueryClient();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}
export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page: React.ReactNode) => page);
  const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL || '';

  React.useEffect(() => {
    if (MIXPANEL_TOKEN) {
      mixpanel.init(MIXPANEL_TOKEN, {
        ip: false,
        api_host: MIXPANEL_API_HOST,
      });
    } else {
      console.warn('Mixpanel token not provided. Mixpanel will not be initialized.');
    }
  }, []);

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
          <Web3ReactProvider getLibrary={getWeb3Library}>
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
          </Web3ReactProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </LanguageProvider>
    </CacheProvider>
  );
}
