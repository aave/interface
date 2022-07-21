import { StateCreator } from 'zustand';
import { RootStore } from './root';

export interface WalletSlice {
  account: string;
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
}

export const createWalletSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  WalletSlice
> = (set) => ({
  // account: '0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c', // Treasury holding lot's of mainnet assets
  account: '0xafdabfb6227507ff6522b8a242168f6b5f353a6e', // Top stkAAVE holder to test staking
  isWalletModalOpen: false,
  setWalletModalOpen(open) {
    set({ isWalletModalOpen: open });
  },
});
