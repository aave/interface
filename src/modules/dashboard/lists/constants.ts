import { CustomMarket } from 'src/ui-config/marketsConfig';

export const HIDDEN_ASSETS: Partial<Record<CustomMarket, string[]>> = {
  [CustomMarket.proto_horizon_v3]: [
    '0x17418038ecf73ba4026c4f428547bf099706f27b'.toLowerCase(), // aCRED
  ],
};

export const isAssetHidden = (market: CustomMarket, underlyingAsset: string) => {
  return HIDDEN_ASSETS[market]?.includes(underlyingAsset.toLowerCase());
};
