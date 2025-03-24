import { AaveV3Sonic } from '@bgd-labs/aave-address-book';

const getSonicData = (assetAddress: string): number | undefined => SONIC_DATA_MAP.get(assetAddress);

const SONIC_DATA_MAP: Map<string, number> = new Map([
  [AaveV3Sonic.ASSETS.WETH.A_TOKEN, 4], //
  [AaveV3Sonic.ASSETS.USDCe.A_TOKEN, 12], //
  [AaveV3Sonic.ASSETS.wS.A_TOKEN, 8], // AaveV3Sonic.ASSETS.ws.A_TOKEN
]);

export const useSonicIncentives = (rewardedAsset?: string) => {
  if (!rewardedAsset) {
    return undefined;
  }

  return getSonicData(rewardedAsset);
};
