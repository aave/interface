import '/public/fonts/inter/inter.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import * as FullStory from '@fullstory/browser';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import AaveMetaImage from 'public/aaveMetaLogo-min.jpg';
import * as React from 'react';
import { useEffect } from 'react';
import { AddressBlocked } from 'src/components/AddressBlocked';
import { Meta } from 'src/components/Meta';
import { BorrowModal } from 'src/components/transactions/Borrow/BorrowModal';
import { ClaimRewardsModal } from 'src/components/transactions/ClaimRewards/ClaimRewardsModal';
import { CollateralChangeModal } from 'src/components/transactions/CollateralChange/CollateralChangeModal';
import { EmodeModal } from 'src/components/transactions/Emode/EmodeModal';
import { FaucetModal } from 'src/components/transactions/Faucet/FaucetModal';
import { GasStationProvider } from 'src/components/transactions/GasStation/GasStationProvider';
import { RateSwitchModal } from 'src/components/transactions/RateSwitch/RateSwitchModal';
import { RepayModal } from 'src/components/transactions/Repay/RepayModal';
import { SupplyModal } from 'src/components/transactions/Supply/SupplyModal';
import { SwapModal } from 'src/components/transactions/Swap/SwapModal';
import { WithdrawModal } from 'src/components/transactions/Withdraw/WithdrawModal';
import { Unauthorized } from 'src/components/Unauthorized';
import { BackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextProvider } from 'src/hooks/useModal';
import { PermissionProvider } from 'src/hooks/usePermissions';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';

import createEmotionCache from '../src/createEmotionCache';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';

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
  session: Session;
}

// FullStory flags
let didInit = false;
const useFullStory =
  process.env.NEXT_PUBLIC_ENABLE_2FA === 'true' && process.env.NODE_ENV === 'production';

export default function MyApp(props: MyAppProps) {
  // Load FullStory for the live production environment only
  useEffect(() => {
    if (useFullStory) {
      if (didInit) return;

      FullStory.init({ orgId: 'VBTDS' });
      didInit = true;
    }
  }, []);

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page: React.ReactNode) => page);

  return (
    <SessionProvider session={props.session}>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <Meta
          title={'Open Source Liquidity Protocol'}
          description={
            'Aave is an Open Source Protocol to create Non-Custodial Liquidity Markets to earn interest on supplying and borrowing assets with a variable or stable interest rate. The protocol is designed for easy integration into your products and services.'
          }
          imageUrl={AaveMetaImage.src}
        />
        <Unauthorized>
          <LanguageProvider>
            <Web3ReactProvider getLibrary={getWeb3Library}>
              <Web3ContextProvider>
                <AppGlobalStyles>
                  <AddressBlocked>
                    <PermissionProvider>
                      <ModalContextProvider>
                        <BackgroundDataProvider>
                          <AppDataProvider>
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
                              <FaucetModal />
                            </GasStationProvider>
                          </AppDataProvider>
                        </BackgroundDataProvider>
                      </ModalContextProvider>
                    </PermissionProvider>
                  </AddressBlocked>
                </AppGlobalStyles>
              </Web3ContextProvider>
            </Web3ReactProvider>
          </LanguageProvider>
        </Unauthorized>
      </CacheProvider>
    </SessionProvider>
  );
}
