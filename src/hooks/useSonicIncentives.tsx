// import { AaveV3Sonic } from '@bgd-labs/aave-address-book';

const getSonicData = (assetAddress: string): number | undefined => SONIC_DATA_MAP.get(assetAddress);

const SONIC_DATA_MAP: Map<string, number> = new Map([
  ['0xe18Ab82c81E7Eecff32B8A82B1b7d2d23F1EcE96', 4], //AaveV3Sonic.ASSETS.WETH.A_TOKEN
  ['0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6 ', 10], // AaveV3Sonic.ASSETS.USDC.e.A_TOKEN
  ['0x6C5E14A212c1C3e4Baf6f871ac9B1a969918c131', 8], // AaveV3Sonic.ASSETS.ws.A_TOKEN
]);

export const useSonicIncentives = (rewardedAsset?: string) => {
  if (!rewardedAsset) {
    return undefined;
  }

  return getSonicData(rewardedAsset);
};
