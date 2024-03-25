import { BaseNetworkConfig } from 'src/ui-config/networksConfig';
import {
  getSupportedChainIds,
  marketsData,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';

export interface SupportedNetworkWithChainId extends BaseNetworkConfig {
  chainId: number;
}

export const supportedNetworksConfig: SupportedNetworkWithChainId[] = getSupportedChainIds().map(
  (chainId) => ({
    ...networkConfigs[chainId],
    chainId,
  })
);
export const supportedNetworksWithBridgeMarket = supportedNetworksConfig.filter((elem) =>
  Object.values(marketsData).find(
    (market) => market.chainId === elem.chainId && market.enabledFeatures?.bridge
  )
);

export const getMarketByChainIdWithBridge = (chainId: number) => {
  for (const key in marketsData) {
    const market = marketsData[key];
    if (market.chainId === chainId && market.enabledFeatures && market.enabledFeatures.bridge) {
      return market;
    }
  }
  // Return null if no matching market is found
  return null;
};
