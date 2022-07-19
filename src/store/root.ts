import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { StakeSlice, createStakeSlice } from './stakeSlice';
import { ProtocolDataSlice, createProtocolDataSlice } from './protocolDataSlice';
import { createSingletonSubscriber } from './utils/createSingletonSubscriber';

export interface RootStore extends StakeSlice, ProtocolDataSlice {}

export const useStore = create<RootStore>()(
  devtools(
    persist((...args) => ({
      ...createStakeSlice(...args),
      ...createProtocolDataSlice(...args),
    }))
  )
);

export const useStakeDataSubscription = createSingletonSubscriber(() => {
  useStore.getState().refetchStakeData();
}, 500);
