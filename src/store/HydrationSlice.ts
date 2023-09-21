import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface HydrationSlice {
  hydrated: boolean;
  setHydrated: () => void;
}

export const createHydrationSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  HydrationSlice
> = (set) => {
  return {
    hydrated: false,
    setHydrated: () => set({ hydrated: true }),
  };
};
