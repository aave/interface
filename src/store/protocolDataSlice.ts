import { providers, utils } from 'ethers';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';
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
  setCurrentMarket: (market: CustomMarket, omitQueryParameterUpdate?: boolean) => void;
  tryPermit: (reserveAddress: string) => boolean;
}

export const createProtocolDataSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  ProtocolDataSlice
> = (set, get) => {
  const initialMarket = availableMarkets[0];
  const initialMarketData = marketsData[initialMarket];
  return {
    currentMarket: initialMarket,
    currentMarketData: marketsData[initialMarket],
    currentChainId: initialMarketData.chainId,
    currentNetworkConfig: getNetworkConfig(initialMarketData.chainId),
    jsonRpcProvider: () => getProvider(get().currentChainId),
    setCurrentMarket: (market, omitQueryParameterUpdate) => {
      if (!availableMarkets.includes(market as CustomMarket)) return;
      const nextMarketData = marketsData[market];
      localStorage.setItem('selectedMarket', market);
      if (!omitQueryParameterUpdate) {
        setQueryParameter('marketName', market);
      }
      set({
        currentMarket: market,
        currentMarketData: nextMarketData,
        currentChainId: nextMarketData.chainId,
        currentNetworkConfig: getNetworkConfig(nextMarketData.chainId),
      });
    },
    tryPermit: (reserveAddress: string) => {
      const currentNetworkConfig = get().currentNetworkConfig;
      const currentMarketData = get().currentMarketData;
      const underlyingChainId = currentNetworkConfig.isFork
        ? currentNetworkConfig.underlyingChainId
        : currentMarketData.chainId;
      const tryPermit =
        currentMarketData.v3 &&
        underlyingChainId &&
        permitByChainAndToken[underlyingChainId]?.[utils.getAddress(reserveAddress).toLowerCase()];
      return Boolean(tryPermit);
    },
  };
};
