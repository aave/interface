import '/public/fonts/inter/inter.css';

import { ApolloProvider, ApolloProvider } from '@apollo/client';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import * as React from 'react';
import { apolloClient, apolloClient } from 'src/utils/apolloClient';

import createEmotionCache from '../src/createEmotionCache';
import { ProtocolDataProvider, ProtocolDataProvider } from '../src/hooks/useProtocolData';
import { MainLayout } from '../src/layouts/MainLayout';
import { LanguageProvider } from '../src/libs/LanguageProvider';
// @ts-expect-error this is to dynamically load the web3 provider so it has the windows object
const Web3ContextProvider = dynamic(
  () => import('../src/libs/web3-data-provider').then((mod) => mod.Web3ContextProvider),
  {
    ssr: false,
  }
);

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
              <MainLayout>
                <Component {...pageProps} />
              </MainLayout>
            </ProtocolDataProvider>
          </Web3ContextProvider>
        </LanguageProvider>
      </ApolloProvider>
    </CacheProvider>
  );
}
