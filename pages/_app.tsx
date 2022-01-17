import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../src/createEmotionCache";
import "/public/fonts/inter/inter.css";
import { MainLayout } from "../src/layouts/MainLayout";
import { Web3Provider } from "../src/libs/web3-data-provider";
import { getSupportedChainIds } from "../src/helpers/config/markets-and-network-config";
import { ethers } from "ethers";
import { Web3ReactProvider } from "@web3-react/core";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

function getWeb3Library(provider: any): ethers.providers.Web3Provider {
  return new ethers.providers.Web3Provider(provider);
}

function SafeHydrate({ children }: {children: any}) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  )
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      {/* <SafeHydrate> */}
        <Web3ReactProvider getLibrary={getWeb3Library}>
          <Web3Provider supportedChainIds={getSupportedChainIds()}>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </Web3Provider>
        </Web3ReactProvider>
      {/* </SafeHydrate> */}
    </CacheProvider>
  );
}
