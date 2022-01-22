import '../public/fonts/inter/inter.css';

import * as React from 'react';
import { TxBuilderProvider } from 'src/providers/TxBuilderProvider';

import { CacheProvider, EmotionCache } from '@emotion/react';

import { ApolloProvider } from '@apollo/client';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { AppProps } from 'next/app';
import { ConnectionStatusProvider } from 'src/hooks/useConnectionStatusContext';
import Head from 'next/head';
import { LanguageProvider } from '../src/libs/LanguageProvider';
import { MainLayout } from '../src/layouts/MainLayout';
import { ProtocolDataProvider } from '../src/hooks/useProtocolDataContext';
import { apolloClient } from 'src/utils/apolloClient';
import createEmotionCache from '../src/createEmotionCache';
import { BackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3ContextProvider';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
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
                        <MainLayout>
                          <Component {...pageProps} />
                        </MainLayout>
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
