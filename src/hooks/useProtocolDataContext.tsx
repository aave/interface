import { useEffect, useState } from 'react';
import { useRootStore, useStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { availableMarkets } from 'src/utils/marketsAndNetworksConfig';

// TODO: remove this
// currently this reexport is a workaround so i don't have to alter and potentially create conflicts in 200 files
export const useProtocolDataContext = () => {
  const currentMarket = useStore(useRootStore, (store) => store.currentMarket);
  const [currentMarketStore, setCurrentMarketStore] = useState<CustomMarket>(availableMarkets[0]);

  useEffect(() => {
    if (!currentMarket) return;
    setCurrentMarketStore(currentMarket);
  }, [currentMarket]);

  const [
    currentChainId,
    currentMarketData,
    currentNetworkConfig,
    jsonRpcProvider,
    setCurrentMarket,
  ] = useRootStore((store) => [
    store.currentChainId,
    store.currentMarketData,
    store.currentNetworkConfig,
    store.jsonRpcProvider,
    store.setCurrentMarket,
  ]);

  // console.log('the current market', currentMarket);
  return {
    currentMarket: currentMarketStore,
    currentMarketStore,
    currentChainId,
    currentMarketData,
    currentNetworkConfig,
    jsonRpcProvider,
    setCurrentMarket,
    setCurrentMarketStore,
  };
};
