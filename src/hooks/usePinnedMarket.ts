import { useEffect } from 'react';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';

/**
 * Pins the app's selected market to `market` for the lifetime of the calling page, restoring the
 * user's prior market on unmount — so a page that must run on a single instance (e.g. staking /
 * safety module on Core) can force it without a lasting global change. The header, lists, and tx
 * modals all read the market from the store, so pinning here covers the whole page. No-op when
 * already on `market`.
 */
export const usePinnedMarket = (market: CustomMarket) => {
  useEffect(() => {
    const { currentMarket: prevMarket, setCurrentMarket } = useRootStore.getState();
    if (prevMarket !== market) {
      setCurrentMarket(market, true); // true = don't touch the URL query param
      return () => setCurrentMarket(prevMarket, true);
    }
  }, [market]);
};
