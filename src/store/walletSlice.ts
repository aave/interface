import { StateCreator } from 'zustand';

import { RootStore } from './root';

export enum ApprovalMethod {
  APPROVE = 'Transaction',
  PERMIT = 'Signed message',
}

export enum ApprovalAmount {
  EXACT = 'Exact amount',
  UNLIMITED = 'Unlimited',
}

export interface WalletSlice {
  account: string;
  walletType: string | undefined;
  setAccount: (account: string | undefined) => void;
  setWalletType: (walletType: string | undefined) => void;
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  walletApprovalMethodPreference: ApprovalMethod;
  setWalletApprovalMethodPreference: (method: ApprovalMethod) => void;
  refreshWalletApprovalMethod: () => void;
  walletApprovalAmountPreference: ApprovalAmount;
  setWalletApprovalAmountPreference: (amount: ApprovalAmount) => void;
  refreshWalletApprovalAmount: () => void;
  connectedAccountIsContract: boolean;
  setConnectedAccountIsContract: (isContract: boolean) => void;
}

const getWalletPreferences = () => {
  const walletPreference = localStorage.getItem('walletApprovalPreferences');
  if (walletPreference) {
    return JSON.parse(walletPreference);
  } else {
    return {};
  }
};

// Kept in its own key rather than folded into walletApprovalPreferences, whose values are
// bare ApprovalMethod strings and would need migrating to hold a second dimension.
const getWalletAmountPreferences = () => {
  const amountPreference = localStorage.getItem('walletApprovalAmountPreferences');
  if (amountPreference) {
    return JSON.parse(amountPreference);
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
  walletType: undefined,
  setWalletType(walletType) {
    set({ walletType });
  },
  setAccount(account) {
    set({ account: account || '', isWalletModalOpen: false });
    get().refreshWalletApprovalMethod();
    get().refreshWalletApprovalAmount();
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
  walletApprovalAmountPreference: ApprovalAmount.UNLIMITED,
  setWalletApprovalAmountPreference: (amount: ApprovalAmount) => {
    const account = get().account;
    if (account !== '') {
      const amountPreferencesObject = getWalletAmountPreferences();
      amountPreferencesObject[account.toLowerCase()] = amount;
      localStorage.setItem(
        'walletApprovalAmountPreferences',
        JSON.stringify(amountPreferencesObject)
      );
      set(() => ({
        walletApprovalAmountPreference: amount,
      }));
    }
  },
  refreshWalletApprovalAmount: () => {
    const account = get().account;
    if (account !== '') {
      const amountPreferencesObject = getWalletAmountPreferences();
      const accountPreference = amountPreferencesObject[account.toLowerCase()];
      set(() => ({
        walletApprovalAmountPreference: accountPreference
          ? accountPreference
          : ApprovalAmount.UNLIMITED,
      }));
    }
  },
  connectedAccountIsContract: false,
  setConnectedAccountIsContract(isContract) {
    set({ connectedAccountIsContract: isContract });
  },
});
