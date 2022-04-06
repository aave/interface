import '/public/fonts/inter/inter.css';

import { ApolloProvider } from '@apollo/client';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import { Meta } from 'src/components/Meta';
import { BorrowModal } from 'src/components/transactions/Borrow/BorrowModal';
import { ClaimRewardsModal } from 'src/components/transactions/ClaimRewards/ClaimRewardsModal';
import { CollateralChangeModal } from 'src/components/transactions/CollateralChange/CollateralChangeModal';
import { EmodeModal } from 'src/components/transactions/Emode/EmodeModal';
import { GasStationProvider } from 'src/components/transactions/GasStation/GasStationProvider';
import { RateSwitchModal } from 'src/components/transactions/RateSwitch/RateSwitchModal';
import { RepayModal } from 'src/components/transactions/Repay/RepayModal';
import { SupplyModal } from 'src/components/transactions/Supply/SupplyModal';
import { WithdrawModal } from 'src/components/transactions/Withdraw/WithdrawModal';
import { BackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ConnectionStatusProvider } from 'src/hooks/useConnectionStatusContext';
import { ModalContextProvider } from 'src/hooks/useModal';
// import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { TxBuilderProvider } from 'src/providers/TxBuilderProvider';
import { apolloClient } from 'src/utils/apolloClient';

import createEmotionCache from '../src/createEmotionCache';
import { ProtocolDataProvider } from '../src/hooks/useProtocolDataContext';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';
import { SwapModal } from 'src/components/transactions/Swap/SwapModal';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { WalletModalContextProvider } from 'src/hooks/useWalletModal';

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
      <Meta
        title={'Open Source Liquidity Protocol'}
        description={
          'Aave is an Open Source Protocol to create Non-Custodial Liquidity Markets to earn interest on supplying and borrowing assets with a variable or stable interest rate. The protocol is designed for easy integration into your products and services.'
        }
        imageUrl={'https://aave.com/favicon64.png'} //NOTE: Will update with ghost after release
      />

      <ApolloProvider client={apolloClient}>
        <LanguageProvider>
          <Web3ReactProvider getLibrary={getWeb3Library}>
            <Web3ContextProvider>
              <ProtocolDataProvider>
                <ConnectionStatusProvider>
                  <AppGlobalStyles>
                    <BackgroundDataProvider>
                      <AppDataProvider>
                        <TxBuilderProvider>
                          <WalletModalContextProvider>
                            <ModalContextProvider>
                              <GasStationProvider>
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
                              </GasStationProvider>
                            </ModalContextProvider>
                          </WalletModalContextProvider>
                        </TxBuilderProvider>
                      </AppDataProvider>
                    </BackgroundDataProvider>
                  </AppGlobalStyles>
                </ConnectionStatusProvider>
              </ProtocolDataProvider>
            </Web3ContextProvider>
          </Web3ReactProvider>
        </LanguageProvider>
      </ApolloProvider>
    </CacheProvider>
  );
}
