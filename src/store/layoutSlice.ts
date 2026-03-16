import { StateCreator } from 'zustand';

import { RootStore } from './root';

const SHIELD_STORAGE_KEY = 'aaveShieldEnabled';

export type LayoutSlice = {
  setMobileDrawerOpen: (eventName: boolean) => void;
  mobileDrawerOpen: boolean;
  feedbackDialogOpen: boolean;
  setFeedbackOpen: (eventName: boolean) => void;
  supportPrefillMessage?: string;
  setSupportPrefillMessage: (message?: string) => void;
  shieldEnabled: boolean;
  toggleShield: () => void;
  hydrateShield: () => void;
};

const getShieldDefault = (): boolean => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SHIELD_STORAGE_KEY);
  // On by default: if no stored preference, shield is enabled
  if (stored === null) return true;
  return stored === 'true';
};

export const createLayoutSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  LayoutSlice
> = (set, get) => {
  return {
    mobileDrawerOpen: false,
    feedbackDialogOpen: false,
    supportPrefillMessage: undefined,
    shieldEnabled: true,
    setMobileDrawerOpen: (value: boolean) => {
      set({ mobileDrawerOpen: value });
    },
    setFeedbackOpen: (value: boolean) => {
      set({ feedbackDialogOpen: value });
    },
    setSupportPrefillMessage: (message?: string) => {
      set({ supportPrefillMessage: message });
    },
    toggleShield: () => {
      const next = !get().shieldEnabled;
      localStorage.setItem(SHIELD_STORAGE_KEY, String(next));
      set({ shieldEnabled: next });
    },
    hydrateShield: () => {
      set({ shieldEnabled: getShieldDefault() });
    },
  };
};
