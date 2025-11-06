import { CustomMarket } from 'src/ui-config/marketsConfig';

export const HIDDEN_ASSETS: Partial<Record<CustomMarket, string[]>> = {
  // [CustomMarket.proto_horizon_v3]: [
  //   '0x2255718832bc9fd3be1caf75084f4803da14ff01'.toLowerCase(), // VBILL
  // ],
};

export const isAssetHidden = (market: CustomMarket, underlyingAsset: string) => {
  return HIDDEN_ASSETS[market]?.includes(underlyingAsset.toLowerCase());
};
