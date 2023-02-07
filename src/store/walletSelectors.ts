import { RootStore } from './root';

export const selectCurrentWalletBalances = (state: RootStore) => {
  return (
    state?.walletBalances?.[state.account]?.[state.currentChainId]?.[
      state.currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
    ] || []
  );
};
