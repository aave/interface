import { providers } from 'ethers';
import { NetworkConfig } from '../ui-config/networksConfig';
import { CustomMarket, MarketDataType, marketsData } from '../ui-config/marketsConfig';
import { StateCreator } from 'zustand';
import {
  availableMarkets,
  getNetworkConfig,
  getProvider,
} from 'src/utils/marketsAndNetworksConfig';
import { RootStore } from './root';

export interface ProtocolDataSlice {
  currentMarket: CustomMarket;
  currentMarketData: MarketDataType;
  currentChainId: number;
  currentNetworkConfig: NetworkConfig;
  jsonRpcProvider: providers.Provider;
  setCurrentMarket: (market: CustomMarket) => void;
}

export const createProtocolDataSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  ProtocolDataSlice
> = (set) => {
  const initialMarket = availableMarkets[0]; // currently seeded with localStorage, but might not be necessary with persist
  const initialMarketData = marketsData[initialMarket];
  return {
    currentMarket: initialMarket,
    currentMarketData: initialMarketData,
    currentChainId: initialMarketData.chainId,
    currentNetworkConfig: getNetworkConfig(initialMarketData.chainId),
    jsonRpcProvider: getProvider(initialMarketData.chainId),
    setCurrentMarket: (market) => {
      const nextMarketData = marketsData[market];
      set({
        currentMarket: market,
        currentMarketData: nextMarketData,
        currentChainId: nextMarketData.chainId,
        currentNetworkConfig: getNetworkConfig(nextMarketData.chainId),
        jsonRpcProvider: getProvider(nextMarketData.chainId),
      });
    },
  };
};
