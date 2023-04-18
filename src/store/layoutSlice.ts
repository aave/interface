import { StateCreator } from 'zustand';

import { RootStore } from './root';

export type LayoutSlice = {
  setMobileMenuOpen: (eventName: boolean) => void;
  mobileMenuOpen: boolean;
};

export const createLayoutSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  LayoutSlice
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
> = (set) => {
  return {
    mobileMenuOpen: false,
    setMobileMenuOpen: (value: boolean) => {
      set({ mobileMenuOpen: value });
    },
  };
};
