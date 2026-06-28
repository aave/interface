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

type TypePermitParams = {
  reserveAddress: string;
  isWrappedBaseAsset: boolean;
};

export interface ProtocolDataSlice {
  currentMarket: CustomMarket;
  currentMarketData: MarketDataType;
  currentChainId: number;
  currentNetworkConfig: NetworkConfig;
  jsonRpcProvider: (chainId?: number) => providers.Provider;
  setCurrentMarket: (market: CustomMarket, omitQueryParameterUpdate?: boolean) => void;
  tryPermit: ({ reserveAddress, isWrappedBaseAsset }: TypePermitParams) => boolean;
}

export const createProtocolDataSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
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
    jsonRpcProvider: (chainId) => getProvider(chainId ?? get().currentChainId),
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
    tryPermit: ({ reserveAddress, isWrappedBaseAsset }: TypePermitParams) => {
      const currentNetworkConfig = get().currentNetworkConfig;
      const currentMarketData = get().currentMarketData;
      // current chain id, or underlying chain id for fork networks
      const underlyingChainId = currentNetworkConfig.isFork
        ? currentNetworkConfig.underlyingChainId
        : currentMarketData.chainId;
      // enable permit for all v3 test network assets (except WrappedBaseAssets) or v3 production assets included in permitConfig)
      const testnetPermitEnabled = Boolean(
        currentMarketData.v3 &&
          currentNetworkConfig.isTestnet &&
          !currentMarketData.permitDisabled &&
          !isWrappedBaseAsset
      );
      const productionPermitEnabled = Boolean(
        currentMarketData.v3 &&
          underlyingChainId &&
          permitByChainAndToken[underlyingChainId]?.[utils.getAddress(reserveAddress).toLowerCase()]
      );
      return testnetPermitEnabled || productionPermitEnabled;
    },
  };
};
