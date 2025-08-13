import { AaveV3Ethereum, AaveV3EthereumLido } from '@bgd-labs/aave-address-book';

const getEthenaData = (assetAddress: string): number | undefined =>
  ETHENA_DATA_MAP.get(assetAddress);

const ETHENA_DATA_MAP: Map<string, number> = new Map([
  [AaveV3Ethereum.ASSETS.USDe.A_TOKEN, 5],
  [AaveV3Ethereum.ASSETS.sUSDe.A_TOKEN, 5],
  [AaveV3EthereumLido.ASSETS.sUSDe.A_TOKEN, 5],
  [AaveV3Ethereum.ASSETS.GHO.V_TOKEN, 5],
  [AaveV3EthereumLido.ASSETS.GHO.V_TOKEN, 5],
  [AaveV3Ethereum.ASSETS.PT_eUSDE_29MAY2025.A_TOKEN, 2],
  [AaveV3Ethereum.ASSETS.PT_eUSDE_14AUG2025.A_TOKEN, 2],
  [AaveV3Ethereum.ASSETS.PT_USDe_31JUL2025.A_TOKEN, 2],
  [AaveV3Ethereum.ASSETS.PT_sUSDE_31JUL2025.A_TOKEN, 1],
  [AaveV3Ethereum.ASSETS.PT_sUSDE_31JUL2025.A_TOKEN, 1],
  [AaveV3Ethereum.ASSETS.PT_sUSDE_25SEP2025.A_TOKEN, 1],
]);

export const useEthenaIncentives = (rewardedAsset?: string) => {
  if (!rewardedAsset) {
    return undefined;
  }

  return getEthenaData(rewardedAsset);
};
