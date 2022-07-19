import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { StakeSlice, createStakeSlice } from './stakeSlice';
import { ProtocolDataSlice, createProtocolDataSlice } from './protocolDataSlice';
import { createSingletonSubscriber } from './utils/createSingletonSubscriber';

export interface RootStore extends StakeSlice, ProtocolDataSlice {}

export const useRootStore = create<RootStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createStakeSlice(...args),
        ...createProtocolDataSlice(...args),
      }),
      { name: 'root' }
    )
  )
);

export const useStakeDataSubscription = createSingletonSubscriber(() => {
  useRootStore.getState().refetchStakeData();
}, 60000);
