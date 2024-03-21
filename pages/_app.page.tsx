import '/public/fonts/inter/inter.css';
import '/src/styles/variables.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import { NoSsr } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Web3ReactProvider } from '@web3-react/core';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { AddressBlocked } from 'src/components/AddressBlocked';
import { Meta } from 'src/components/Meta';
import { TransactionEventHandler } from 'src/components/TransactionEventHandler';
import { GasStationProvider } from 'src/components/transactions/GasStation/GasStationProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextProvider } from 'src/hooks/useModal';
import { PermissionProvider } from 'src/hooks/usePermissions';
import { connectors } from 'src/libs/web3-data-provider/connectors';
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { SharedDependenciesProvider } from 'src/ui-config/SharedDependenciesProvider';

import createEmotionCache from '../src/createEmotionCache';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';

const SwitchModal = dynamic(() =>
  import('src/components/transactions/Switch/SwitchModal').then((module) => module.SwitchModal)
);

const BorrowModal = dynamic(() =>
  import('src/components/transactions/Borrow/BorrowModal').then((module) => module.BorrowModal)
);
const ClaimRewardsModal = dynamic(() =>
  import('src/components/transactions/ClaimRewards/ClaimRewardsModal').then(
    (module) => module.ClaimRewardsModal
  )
);
const CollateralChangeModal = dynamic(() =>
  import('src/components/transactions/CollateralChange/CollateralChangeModal').then(
    (module) => module.CollateralChangeModal
  )
);
const DebtSwitchModal = dynamic(() =>
  import('src/components/transactions/DebtSwitch/DebtSwitchModal').then(
    (module) => module.DebtSwitchModal
  )
);
const EmodeModal = dynamic(() =>
  import('src/components/transactions/Emode/EmodeModal').then((module) => module.EmodeModal)
);
const FaucetModal = dynamic(() =>
  import('src/components/transactions/Faucet/FaucetModal').then((module) => module.FaucetModal)
);
const MigrateV3Modal = dynamic(() =>
  import('src/components/transactions/MigrateV3/MigrateV3Modal').then(
    (module) => module.MigrateV3Modal
  )
);
const RateSwitchModal = dynamic(() =>
  import('src/components/transactions/RateSwitch/RateSwitchModal').then(
    (module) => module.RateSwitchModal
  )
);
const RepayModal = dynamic(() =>
  import('src/components/transactions/Repay/RepayModal').then((module) => module.RepayModal)
);
const SupplyModal = dynamic(() =>
  import('src/components/transactions/Supply/SupplyModal').then((module) => module.SupplyModal)
);
const SwapModal = dynamic(() =>
  import('src/components/transactions/Swap/SwapModal').then((module) => module.SwapModal)
);
const WithdrawModal = dynamic(() =>
  import('src/components/transactions/Withdraw/WithdrawModal').then(
    (module) => module.WithdrawModal
  )
);
const StakingMigrateModal = dynamic(() =>
  import('src/components/transactions/StakingMigrate/StakingMigrateModal').then(
    (module) => module.StakingMigrateModal
  )
);

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
  const getLayout = Component.getLayout ?? ((page: ReactNode) => page);
  const initializeMixpanel = useRootStore((store) => store.initializeMixpanel);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL;
  useEffect(() => {
    if (MIXPANEL_TOKEN) {
      initializeMixpanel();
    } else {
      console.log('no analytics tracking');
    }
  }, [MIXPANEL_TOKEN, initializeMixpanel]);

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
      <NoSsr>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <Web3ReactProvider connectors={connectors}>
              <Web3ContextProvider>
                <AppGlobalStyles>
                  <AddressBlocked>
                    <PermissionProvider>
                      <ModalContextProvider>
                        <SharedDependenciesProvider>
                          <AppDataProvider>
                            <GasStationProvider>
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
                              <SwitchModal />
                              <StakingMigrateModal />
                            </GasStationProvider>
                          </AppDataProvider>
                        </SharedDependenciesProvider>
                      </ModalContextProvider>
                    </PermissionProvider>
                  </AddressBlocked>
                </AppGlobalStyles>
              </Web3ContextProvider>
            </Web3ReactProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </LanguageProvider>
      </NoSsr>
    </CacheProvider>
  );
}
