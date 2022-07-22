import { WalletBalanceProvider } from '@aave/contract-helpers';
import { StateCreator } from 'zustand';
import { RootStore } from './root';

export interface WalletSlice {
  account: string;
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  walletBalances?: {
    [address: string]: { [chainId: number]: { address: string; amount: string }[] };
  };
  refetchWalletBalances: () => Promise<void>;
}

export const createWalletSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  WalletSlice
> = (set, get) => ({
  // as this is currently 100% mocked you need to also set mockWalletAddress accordingly
  account: '0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c', // Treasury holding lot's of mainnet assets
  // account: '0xafdabfb6227507ff6522b8a242168f6b5f353a6e', // Top stkAAVE holder to test staking
  isWalletModalOpen: false,
  setWalletModalOpen(open) {
    set({ isWalletModalOpen: open });
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
    try {
      const { 0: tokenAddresses, 1: balances } =
        await contract.getUserWalletBalancesForLendingPoolProvider(
          account,
          currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
        );
      const mappedBalances = tokenAddresses.map((address, ix) => ({
        address: address.toLowerCase(),
        amount: balances[ix].toString(),
      }));
      set((state) => ({
        walletBalances: {
          ...state.walletBalances,
          [account]: { ...state.walletBalances?.[account], [currentChainId]: mappedBalances },
        },
      }));
    } catch (e) {
      console.log('error fetching wallet balances');
    }
  },
});
