import { providers } from 'ethers';
import {
  availableMarkets,
  getNetworkConfig,
  getProvider,
  marketsData,
} from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { CustomMarket, MarketDataType } from '../ui-config/marketsConfig';
import { NetworkConfig } from '../ui-config/networksConfig';
import { RootStore } from './root';
import { getQueryParameter, setQueryParameter } from './utils/queryParams';

export interface ProtocolDataSlice {
  currentMarket: CustomMarket;
  currentMarketData: MarketDataType;
  currentChainId: number;
  currentNetworkConfig: NetworkConfig;
  jsonRpcProvider: () => providers.Provider;
  setCurrentMarket: (market: CustomMarket) => void;
}

export const createProtocolDataSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  ProtocolDataSlice
> = (set, get) => {
  const preselectedMarket = getQueryParameter('marketName') as CustomMarket;
  const initialMarket = availableMarkets.includes(preselectedMarket)
    ? preselectedMarket
    : availableMarkets[0]; // currently seeded with localStorage, but might not be necessary with persist
  const initialMarketData = marketsData[initialMarket];
  return {
    currentMarket: initialMarket,
    currentMarketData: initialMarketData,
    currentChainId: initialMarketData.chainId,
    currentNetworkConfig: getNetworkConfig(initialMarketData.chainId),
    jsonRpcProvider: () => getProvider(get().currentChainId),
    setCurrentMarket: (market) => {
      const nextMarketData = marketsData[market];
      setQueryParameter('marketName', market);
      set({
        currentMarket: market,
        currentMarketData: nextMarketData,
        currentChainId: nextMarketData.chainId,
        currentNetworkConfig: getNetworkConfig(nextMarketData.chainId),
      });
    },
  };
};
