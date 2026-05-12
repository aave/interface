import { BigNumber } from 'bignumber.js';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';
import {
  getSupportedChainIds,
  marketsData,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';

// Reserve values from @aave/math-utils (variableBorrows, underlyingBalance)
// carry RAY-level precision (scaledBalance * index / RAY), which can exceed
// the token's native decimals. Truncate down so downstream parseUnits calls
// accept the Max value the user sees.
export const truncateToTokenDecimals = (value: string, decimals: number) =>
  new BigNumber(value).decimalPlaces(decimals, BigNumber.ROUND_DOWN).toString(10);

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
