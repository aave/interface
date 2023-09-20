import { useRootStore } from 'src/store/root';
import {
  availableMarkets,
  getNetworkConfig,
  marketsData,
} from 'src/utils/marketsAndNetworksConfig';

const initialMarket = availableMarkets[0];
const initialMarketData = marketsData[initialMarket];

// TODO: remove this
// currently this reexport is a workaround so i don't have to alter and potentially create conflicts in 200 files
export const useProtocolDataContext = () => {
  const [
    currentMarket,
    currentChainId,
    currentMarketData,
    currentNetworkConfig,
    jsonRpcProvider,
    setCurrentMarket,
    hydrated,
  ] = useRootStore((store) => [
    store.currentMarket,
    store.currentChainId,
    store.currentMarketData,
    store.currentNetworkConfig,
    store.jsonRpcProvider,
    store.setCurrentMarket,
    store.hydrated,
  ]);

  // The data returned when hydrated is false is the same as the initial store data to prevent ssr/hydration issues.
  return {
    currentMarket: hydrated ? currentMarket : initialMarket,
    currentMarketData: hydrated ? currentMarketData : marketsData[initialMarket],
    currentChainId: hydrated ? currentChainId : initialMarketData.chainId,
    currentNetworkConfig: hydrated
      ? currentNetworkConfig
      : getNetworkConfig(initialMarketData.chainId),
    jsonRpcProvider,
    setCurrentMarket,
  };
};
