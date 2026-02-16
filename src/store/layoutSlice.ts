import { StateCreator } from 'zustand';

import { RootStore } from './root';

export type LayoutSlice = {
  setMobileDrawerOpen: (eventName: boolean) => void;
  mobileDrawerOpen: boolean;
  feedbackDialogOpen: boolean;
  setFeedbackOpen: (eventName: boolean) => void;
  supportPrefillMessage?: string;
  setSupportPrefillMessage: (message?: string) => void;
};

export const createLayoutSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  LayoutSlice
> = (set) => {
  return {
    mobileDrawerOpen: false,
    feedbackDialogOpen: false,
    supportPrefillMessage: undefined,
    setMobileDrawerOpen: (value: boolean) => {
      set({ mobileDrawerOpen: value });
    },
    setFeedbackOpen: (value: boolean) => {
      set({ feedbackDialogOpen: value });
    },
    setSupportPrefillMessage: (message?: string) => {
      set({ supportPrefillMessage: message });
    },
  };
};
