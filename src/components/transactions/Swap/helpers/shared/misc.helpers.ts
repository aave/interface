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

// TODO: join and make sure at least one provider supports it
export const supportedNetworksWithEnabledMarket = supportedNetworksConfig.filter((elem) =>
  Object.values(marketsData).find(
    (market) => market.chainId === elem.chainId && market.enabledFeatures?.switch // TODO: change to swap
  )
);

export const supportedNetworksWithEnabledMarketLimit = supportedNetworksConfig.filter((elem) =>
  Object.values(marketsData).find(
    (market) => market.chainId === elem.chainId && market.enabledFeatures?.limit
  )
);
