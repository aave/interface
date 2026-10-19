const getEthenaData = (assetAddress: string): number | undefined =>
  ETHENA_DATA_MAP.get(assetAddress);
// Deactivated indefinetly due to Ethena closing its points program.
const ETHENA_DATA_MAP: Map<string, number> = new Map([]);

export const useEthenaIncentives = (rewardedAsset?: string) => {
  if (!rewardedAsset) {
    return undefined;
  }

  return getEthenaData(rewardedAsset);
};
