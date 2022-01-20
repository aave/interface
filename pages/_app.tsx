import '../public/fonts/inter/inter.css';

import { ApolloProvider } from '@apollo/client';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import { apolloClient } from 'src/utils/apolloClient';

import createEmotionCache from '../src/createEmotionCache';
import { ProtocolDataProvider } from '../src/hooks/useProtocolData';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { MainLayout } from '../src/layouts/MainLayout';
import { LanguageProvider } from '../src/libs/LanguageProvider';
import { Web3ContextProvider } from '../src/libs/web3-data-provider/Web3ContextProvider';

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
          <ProtocolDataProvider>
            <Web3ContextProvider>
              <AppGlobalStyles>
                <MainLayout>
                  <Component {...pageProps} />
                </MainLayout>
              </AppGlobalStyles>
            </Web3ContextProvider>
          </ProtocolDataProvider>
        </LanguageProvider>
      </ApolloProvider>
    </CacheProvider>
  );
}
