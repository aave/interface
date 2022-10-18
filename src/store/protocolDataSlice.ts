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
import { setQueryParameter } from './utils/queryParams';

export interface ProtocolDataSlice {
  currentMarket: CustomMarket;
  currentMarketData: MarketDataType;
  currentChainId: number;
  currentNetworkConfig: NetworkConfig;
  jsonRpcProvider: () => providers.Provider;
  setCurrentMarket: (market: CustomMarket) => void;
}

const getCurrentMarket = (): CustomMarket => {
  const preselectedMarket = availableMarkets[0];

  return availableMarkets.includes(preselectedMarket as CustomMarket)
    ? (preselectedMarket as CustomMarket)
    : (availableMarkets[0] as CustomMarket);
};

export const createProtocolDataSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  ProtocolDataSlice
> = (set, get) => {
  const initialMarket = getCurrentMarket();
  const initialMarketData = marketsData[initialMarket];
  return {
    currentMarket: initialMarket,
    currentMarketData: marketsData[initialMarket],
    currentChainId: initialMarketData.chainId,
    currentNetworkConfig: getNetworkConfig(initialMarketData.chainId),
    jsonRpcProvider: () => getProvider(get().currentChainId),
    setCurrentMarket: (market) => {
      const nextMarketData = marketsData[market];
      setQueryParameter('marketName', market);
      localStorage.setItem('marketName', market);
      set({
        currentMarket: market,
        currentMarketData: nextMarketData,
        currentChainId: nextMarketData.chainId,
        currentNetworkConfig: getNetworkConfig(nextMarketData.chainId),
      });
    },
  };
};
