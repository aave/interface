import { CustomMarket } from 'src/ui-config/marketsConfig';

export const HIDDEN_ASSETS: Partial<Record<CustomMarket, string[]>> = {};

export const isAssetHidden = (market: CustomMarket, underlyingAsset: string) => {
  return HIDDEN_ASSETS[market]?.includes(underlyingAsset.toLowerCase());
};
