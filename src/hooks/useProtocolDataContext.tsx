import { useRootStore } from 'src/store/root';

// TODO: remove this
// currently this reexport is a workaround so i don't have to alter and potentially create conflicts in 200 files
/**
 * @deprecated Use useRootStore hook instead
 */
export const useProtocolDataContext = () =>
  useRootStore(
    ({
      currentChainId,
      currentMarket,
      currentMarketData,
      currentNetworkConfig,
      jsonRpcProvider,
      setCurrentMarket,
    }) => ({
      currentChainId,
      currentMarket,
      currentMarketData,
      currentNetworkConfig,
      jsonRpcProvider,
      setCurrentMarket,
    })
  );
