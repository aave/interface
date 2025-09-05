import { CustomMarket } from 'src/ui-config/marketsConfig';

export const HIDDEN_ASSETS: Partial<Record<CustomMarket, string[]>> = {
  [CustomMarket.proto_horizon_v3]: [
    '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b'.toLowerCase(), // USYC
  ],
};

export const isAssetHidden = (market: CustomMarket, underlyingAsset: string) => {
  return HIDDEN_ASSETS[market]?.includes(underlyingAsset.toLowerCase());
};
