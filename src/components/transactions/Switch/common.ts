import {
  getSupportedChainIds,
  marketsData,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';

export const supportedNetworksConfig = getSupportedChainIds().map((chainId) => ({
  ...networkConfigs[chainId],
  chainId,
}));
export const supportedNetworksWithEnabledMarket = supportedNetworksConfig.filter((elem) =>
  Object.values(marketsData).find(
    (market) => market.chainId === elem.chainId && market.enabledFeatures?.switch
  )
);
