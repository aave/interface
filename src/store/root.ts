import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createSingletonSubscriber } from './utils/createSingletonSubscriber';

import { StakeSlice, createStakeSlice } from './stakeSlice';
import { ProtocolDataSlice, createProtocolDataSlice } from './protocolDataSlice';
import { WalletSlice, createWalletSlice } from './walletSlice';
import { PoolSlice, createPoolSlice } from './poolSlice';
import { IncentiveSlice, createIncentiveSlice } from './incentiveSlice';

export interface RootStore
  extends StakeSlice,
    ProtocolDataSlice,
    WalletSlice,
    PoolSlice,
    IncentiveSlice {}

export const useRootStore = create<RootStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createStakeSlice(...args),
        ...createProtocolDataSlice(...args),
        ...createWalletSlice(...args),
        ...createPoolSlice(...args),
        ...createIncentiveSlice(...args),
      }),
      { name: 'root' }
    )
  )
);

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
