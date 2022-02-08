import '/public/fonts/inter/inter.css';

import { ApolloProvider } from '@apollo/client';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import { BackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ConnectionStatusProvider } from 'src/hooks/useConnectionStatusContext';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { TxBuilderProvider } from 'src/providers/TxBuilderProvider';
import { apolloClient } from 'src/utils/apolloClient';

import createEmotionCache from '../src/createEmotionCache';
import { ProtocolDataProvider } from '../src/hooks/useProtocolDataContext';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';
import { ModalContextProvider } from 'src/hooks/useModal';
import { SupplyModal } from 'src/components/Supply/SupplyModal';
import { WithdrawModal } from 'src/components/Withdraw/WithdrawModal';
import { BorrowModal } from 'src/components/Borrow/BorrowModal';
import { CollateralChangeModal } from 'src/components/CollateralChange/CollateralChangeModal';
import { RepayModal } from 'src/components/Repay/RepayModal';
import { RateSwitchModal } from 'src/components/RateSwitch/RateSwitchModal';

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
  const getLayout = Component.getLayout ?? ((page: React.ReactNode) => page);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ApolloProvider client={apolloClient}>
        <LanguageProvider>
          <Web3ContextProvider>
            <ProtocolDataProvider>
              <ConnectionStatusProvider>
                <AppGlobalStyles>
                  <BackgroundDataProvider>
                    <AppDataProvider>
                      <TxBuilderProvider>
                        <AppGlobalStyles>
                          <ModalContextProvider>
                            {getLayout(<Component {...pageProps} />)}
                            <SupplyModal />
                            <WithdrawModal />
                            <BorrowModal />
                            <RepayModal />
                            <CollateralChangeModal />
                            <RateSwitchModal />
                          </ModalContextProvider>
                        </AppGlobalStyles>
                      </TxBuilderProvider>
                    </AppDataProvider>
                  </BackgroundDataProvider>
                </AppGlobalStyles>
              </ConnectionStatusProvider>
            </ProtocolDataProvider>
          </Web3ContextProvider>
        </LanguageProvider>
      </ApolloProvider>
    </CacheProvider>
  );
}
