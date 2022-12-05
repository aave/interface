import { enableMapSet } from 'immer';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

import { createGhoSlice, GhoSlice } from './ghoSlice';
import { createGovernanceSlice, GovernanceSlice } from './governanceSlice';
import { createIncentiveSlice, IncentiveSlice } from './incentiveSlice';
import { createPoolSlice, PoolSlice } from './poolSlice';
import { createProtocolDataSlice, ProtocolDataSlice } from './protocolDataSlice';
import { createStakeSlice, StakeSlice } from './stakeSlice';
import { createSingletonSubscriber } from './utils/createSingletonSubscriber';
import { getQueryParameter } from './utils/queryParams';
import { createWalletSlice, WalletSlice } from './walletSlice';

enableMapSet();

export type RootStore = StakeSlice &
  ProtocolDataSlice &
  WalletSlice &
  PoolSlice &
  IncentiveSlice &
  GovernanceSlice &
  GhoSlice;

export const useRootStore = create<RootStore>()(
  devtools((...args) => {
    return {
      ...createStakeSlice(...args),
      ...createProtocolDataSlice(...args),
      ...createWalletSlice(...args),
      ...createPoolSlice(...args),
      ...createIncentiveSlice(...args),
      ...createGovernanceSlice(...args),
      ...createGhoSlice(...args),
    };
  })
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

// TODO: in all of the refetch methods across all slices, ensure that the store does not get updated if the data does not changes. IOW, turn a global update into a very atomic approach to reduce the amount of rerenders that occur based off of the AppDataProvider context provider's data.
export const useStakeDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refetchStakeData();
}, 60000);

export const useWalletBalancesSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refetchWalletBalances();
}, 60000);

export const usePoolDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolData();
}, 60000);

export const useIncentiveDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshIncentiveData();
}, 60000);

export const useGovernanceDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshGovernanceData();
}, 60000);

export const useGhoDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshGhoData();
}, 60000);
