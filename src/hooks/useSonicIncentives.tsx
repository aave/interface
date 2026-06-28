const getSonicData = (assetAddress: string): number | undefined => SONIC_DATA_MAP.get(assetAddress);

const SONIC_DATA_MAP: Map<string, number> = new Map([
  // No incentives at the moment
]);

export const useSonicIncentives = (rewardedAsset?: string) => {
  if (!rewardedAsset) {
    return undefined;
  }

  return getSonicData(rewardedAsset);
};
