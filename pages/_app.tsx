import * as React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../src/createEmotionCache';
import '/public/fonts/inter/inter.css';
import { MainLayout } from '../src/layouts/MainLayout';
import { LanguageProvider } from '../src/libs/LanguageProvider';
import dynamic from 'next/dynamic';
// import { getSupportedChainIds } from 'src/helpers/config/markets-and-network-config';
// import { Web3ReactProvider } from '@web3-react/core';
// import { Web3Provider } from 'src/libs/web3-data-provider';
// import { Web3ContextProvider } from 'src/libs/web3-data-provider';

// @ts-ignore
const Web3ContextProvider = dynamic(() => import("../src/libs/web3-data-provider").then(mod => mod.Web3ContextProvider), {
  ssr: false,
});

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

// function getWeb3Library(provider: any): ethers.providers.Web3Provider {
//   return new ethers.providers.Web3Provider(provider);
// }

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      {/* <Web3ReactProvider getLibrary={getWeb3Library}>
        <Web3Provider supportedChainIds={getSupportedChainIds()}> */}
        <Web3ContextProvider>
          <LanguageProvider>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </LanguageProvider>
        </Web3ContextProvider>
        {/* </Web3Provider> */}
      {/* </Web3ReactProvider> */}
    </CacheProvider>
  );
}
