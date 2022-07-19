import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createSingletonSubscriber } from './utils/createSingletonSubscriber';

import { StakeSlice, createStakeSlice } from './stakeSlice';
import { ProtocolDataSlice, createProtocolDataSlice } from './protocolDataSlice';
import { WalletSlice, createWalletSlice } from './walletSlice';

export interface RootStore extends StakeSlice, ProtocolDataSlice, WalletSlice {}

export const useRootStore = create<RootStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createStakeSlice(...args),
        ...createProtocolDataSlice(...args),
        ...createWalletSlice(...args),
      }),
      { name: 'root' }
    )
  )
);

export const useStakeDataSubscription = createSingletonSubscriber(() => {
  useRootStore.getState().refetchStakeData();
}, 60000);
