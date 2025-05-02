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
export const supportedNetworksWithEnabledMarket = supportedNetworksConfig.filter((elem) => {
  console.debug(
    elem.chainId,
    Object.values(marketsData).find(
      (market) => market.chainId === elem.chainId && market.enabledFeatures?.switch
    )
  );

  return Object.values(marketsData).find(
    (market) => market.chainId === elem.chainId && market.enabledFeatures?.switch
  );
});
