import { Web3Provider } from '@ethersproject/providers';
import { WalletType } from 'src/libs/web3-data-provider/WalletOptions';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export enum ApprovalMethod {
  APPROVE = 'Transaction',
  PERMIT = 'Signed message',
}

export interface WalletSlice {
  account: string;
  accountLoading: boolean;
  walletType: WalletType | undefined;
  walletProvider?: Web3Provider;
  setWalletProvider: (jsonRpc?: Web3Provider) => void;
  setAccount: (account: string | undefined) => void;
  setAccountLoading: (loading: boolean) => void;
  setWalletType: (walletType: WalletType | undefined) => void;
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  walletApprovalMethodPreference: ApprovalMethod;
  setWalletApprovalMethodPreference: (method: ApprovalMethod) => void;
  refreshWalletApprovalMethod: () => void;
}

const getWalletPreferences = () => {
  const walletPreference = localStorage.getItem('walletApprovalPreferences');
  if (walletPreference) {
    return JSON.parse(walletPreference);
  } else {
    return {};
  }
};

export const createWalletSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  WalletSlice
> = (set, get) => ({
  account: '',
  accountLoading: false,
  walletProvider: undefined,
  walletType: undefined,
  setWalletType(walletType) {
    set({ walletType });
  },
  setWalletProvider(rpcJsonProvider) {
    set({ walletProvider: rpcJsonProvider });
  },
  setAccount(account) {
    set({ account: account || '', isWalletModalOpen: false });
    const refresh = get().refreshWalletApprovalMethod;
    refresh();
  },
  setAccountLoading(loading) {
    set({ accountLoading: loading });
  },
  isWalletModalOpen: false,
  setWalletModalOpen(open) {
    set({ isWalletModalOpen: open });
  },
  walletApprovalMethodPreference: ApprovalMethod.PERMIT,
  setWalletApprovalMethodPreference: (method: ApprovalMethod) => {
    const account = get().account;
    if (account !== '') {
      const walletPreferencesObject = getWalletPreferences();
      walletPreferencesObject[account.toLowerCase()] = method;
      localStorage.setItem('walletApprovalPreferences', JSON.stringify(walletPreferencesObject));
      set(() => ({
        walletApprovalMethodPreference: method,
      }));
    }
  },
  refreshWalletApprovalMethod: () => {
    const account = get().account;
    if (account !== '') {
      const walletPreferencesObject = getWalletPreferences();
      const accountPreference = walletPreferencesObject[account.toLowerCase()];
      set(() => ({
        walletApprovalMethodPreference: accountPreference
          ? accountPreference
          : ApprovalMethod.PERMIT,
      }));
    }
  },
});
