import { StateCreator } from 'zustand';
import { RootStore } from './root';

export interface WalletSlice {
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
}

export const createWalletSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  WalletSlice
> = (set, get) => ({
  isWalletModalOpen: false,
  setWalletModalOpen(open) {
    set({ isWalletModalOpen: open });
  },
});
