import { WalletBalanceProvider } from '@aave/contract-helpers';
import { StateCreator } from 'zustand';
import { RootStore } from './root';

type WalletBalance = { address: string; amount: string };

export interface WalletSlice {
  account: string;
  setAccount: (account: string | undefined) => void;
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  walletBalances?: {
    [account: string]: {
      [chainId: number]: { [address: string]: WalletBalance[] };
    };
  };
  refetchWalletBalances: () => Promise<void>;
  computed: {
    get currentWalletBalances(): WalletBalance[];
  };
}

export const createWalletSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  WalletSlice
> = (set, get) => ({
  account: '',
  setAccount(account) {
    set({ account: account || '' });
  },
  isWalletModalOpen: false,
  setWalletModalOpen(open) {
    set({ isWalletModalOpen: open });
  },
  computed: {
    get currentWalletBalances() {
      return (
        get()?.walletBalances?.[get().account]?.[get().currentChainId]?.[
          get().currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
        ] || []
      );
    },
  },
  refetchWalletBalances: async () => {
    const account = get().account;
    if (!account) return;
    const currentMarketData = get().currentMarketData;
    const currentChainId = get().currentChainId;
    const contract = new WalletBalanceProvider({
      walletBalanceProviderAddress: currentMarketData.addresses.WALLET_BALANCE_PROVIDER,
      provider: get().jsonRpcProvider(),
    });
    const lendingPoolAddressProvider = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
    try {
      const { 0: tokenAddresses, 1: balances } =
        await contract.getUserWalletBalancesForLendingPoolProvider(
          account,
          lendingPoolAddressProvider
        );
      const mappedBalances = tokenAddresses.map((address, ix) => ({
        address: address.toLowerCase(),
        amount: balances[ix].toString(),
      }));
      set((state) => ({
        walletBalances: {
          ...state.walletBalances,
          [account]: {
            ...state.walletBalances?.[account],
            [currentChainId]: { [lendingPoolAddressProvider]: mappedBalances },
          },
        },
      }));
    } catch (e) {
      console.log('error fetching wallet balances');
    }
  },
});
