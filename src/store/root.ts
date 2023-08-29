import { enableMapSet } from 'immer';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import create from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { AnalyticsSlice, createAnalyticsSlice } from './analyticsSlice';
import { createGhoSlice, GhoSlice } from './ghoSlice';
import { createGovernanceSlice, GovernanceSlice } from './governanceSlice';
import { createIncentiveSlice, IncentiveSlice } from './incentiveSlice';
import { createLayoutSlice, LayoutSlice } from './layoutSlice';
import { createPoolSlice, PoolSlice } from './poolSlice';
import { createProtocolDataSlice, ProtocolDataSlice } from './protocolDataSlice';
import { createStakeSlice, StakeSlice } from './stakeSlice';
import { createTransactionsSlice, TransactionsSlice } from './transactionsSlice';
import { createSingletonSubscriber } from './utils/createSingletonSubscriber';
import { getQueryParameter } from './utils/queryParams';
import { createV3MigrationSlice, V3MigrationSlice } from './v3MigrationSlice';
import { createWalletDomainsSlice, WalletDomainsSlice } from './walletDomains';
import { createWalletSlice, WalletSlice } from './walletSlice';

enableMapSet();

export type RootStore = StakeSlice &
  ProtocolDataSlice &
  WalletSlice &
  PoolSlice &
  IncentiveSlice &
  GovernanceSlice &
  V3MigrationSlice &
  GhoSlice &
  WalletDomainsSlice &
  AnalyticsSlice &
  TransactionsSlice &
  LayoutSlice;

export const useRootStore = create<RootStore>()(
  subscribeWithSelector(
    devtools((...args) => {
      return {
        ...createStakeSlice(...args),
        ...createProtocolDataSlice(...args),
        ...createWalletSlice(...args),
        ...createPoolSlice(...args),
        ...createIncentiveSlice(...args),
        ...createGovernanceSlice(...args),
        ...createV3MigrationSlice(...args),
        ...createGhoSlice(...args),
        ...createWalletDomainsSlice(...args),
        ...createAnalyticsSlice(...args),
        ...createTransactionsSlice(...args),
        ...createLayoutSlice(...args),
      };
    })
  )
);

// hydrate state from localeStorage to not break on ssr issues
if (typeof document !== 'undefined') {
  document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
      const selectedMarket =
        getQueryParameter('marketName') || localStorage.getItem('selectedMarket');

      if (selectedMarket) {
        const currentMarket = useRootStore.getState().currentMarket;
        const setCurrentMarket = useRootStore.getState().setCurrentMarket;
        if (selectedMarket !== currentMarket) {
          setCurrentMarket(selectedMarket as CustomMarket, true);
        }
      }
    }
  };
}

export const usePoolDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolData();
}, 60000);

export const usePoolDataV3Subscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolV3Data();
}, 60000);

export const useIncentiveDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshIncentiveData();
}, 60000);

export const useGhoDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshGhoData();
}, 60000);

useRootStore.subscribe(
  (state) => state.account,
  (account) => {
    if (account) {
      useRootStore.getState().fetchConnectedWalletDomains();
    } else {
      useRootStore.getState().clearWalletDomains();
    }
  },
  { fireImmediately: true }
);
