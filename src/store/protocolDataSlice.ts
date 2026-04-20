import { ChainId } from '@aave/contract-helpers';
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

type V37Overrides = {
  WETH_GATEWAY: string;
  UI_POOL_DATA_PROVIDER: string;
};

const applyV37ToMarket = (
  market: MarketDataType,
  overrides: V37Overrides | null
): MarketDataType => {
  if (!overrides || (market.chainId !== ChainId.mainnet && market.chainId !== ChainId.arbitrum_one))
    return market;
  return {
    ...market,
    addresses: {
      ...market.addresses,
      WETH_GATEWAY: overrides.WETH_GATEWAY,
      UI_POOL_DATA_PROVIDER: overrides.UI_POOL_DATA_PROVIDER,
    },
  };
};

type TypePermitParams = {
  reserveAddress: string;
  isWrappedBaseAsset: boolean;
};

export interface ProtocolDataSlice {
  currentMarket: CustomMarket;
  currentMarketData: MarketDataType;
  currentChainId: number;
  currentNetworkConfig: NetworkConfig;
  v37Overrides: V37Overrides | null;
  jsonRpcProvider: (chainId?: number) => providers.Provider;
  setCurrentMarket: (market: CustomMarket, omitQueryParameterUpdate?: boolean) => void;
  setV37Overrides: (overrides: V37Overrides | null) => void;
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
    v37Overrides: null,
    jsonRpcProvider: (chainId) => getProvider(chainId ?? get().currentChainId),
    setCurrentMarket: (market, omitQueryParameterUpdate) => {
      if (!availableMarkets.includes(market as CustomMarket)) return;
      const nextMarketData = applyV37ToMarket(marketsData[market], get().v37Overrides);
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
    setV37Overrides: (overrides) => {
      const currentMarket = get().currentMarket;
      set({
        v37Overrides: overrides,
        currentMarketData: applyV37ToMarket(marketsData[currentMarket], overrides),
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
