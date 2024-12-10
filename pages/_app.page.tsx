import '/public/fonts/inter/inter.css';
import '/src/styles/variables.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import { NoSsr } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
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
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { SharedDependenciesProvider } from 'src/ui-config/SharedDependenciesProvider';
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet, optimism } from 'wagmi/chains';

import createEmotionCache from '../src/createEmotionCache';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';

const SwitchModal = dynamic(() =>
  import('src/components/transactions/Switch/SwitchModal').then((module) => module.SwitchModal)
);

const BridgeModal = dynamic(() =>
  import('src/components/transactions/Bridge/BridgeModal').then((module) => module.BridgeModal)
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
const ReadOnlyModal = dynamic(() =>
  import('src/components/WalletConnection/ReadOnlyModal').then((module) => module.ReadOnlyModal)
);

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, optimism],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    appName: 'Aave',
    appDescription: 'Non-custodial liquidity protocol',
    appUrl: 'https://app.aave.com',
    appIcon: 'https://avatars.githubusercontent.com/u/47617460?s=200&v=4',
  })
);

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
        imageUrl="https://app.aave.com/aave-com-opengraph.png"
      />
      <NoSsr>
        <LanguageProvider>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <ConnectKitProvider>
                <Web3ContextProvider>
                  <AppGlobalStyles>
                    <AddressBlocked>
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
                              <DebtSwitchModal />
                              <ClaimRewardsModal />
                              <EmodeModal />
                              <SwapModal />
                              <FaucetModal />
                              <TransactionEventHandler />
                              <SwitchModal />
                              <StakingMigrateModal />
                              <BridgeModal />
                              <ReadOnlyModal />
                            </GasStationProvider>
                          </AppDataProvider>
                        </SharedDependenciesProvider>
                      </ModalContextProvider>
                    </AddressBlocked>
                  </AppGlobalStyles>
                </Web3ContextProvider>
              </ConnectKitProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </WagmiProvider>
        </LanguageProvider>
      </NoSsr>
    </CacheProvider>
  );
}
