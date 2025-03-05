import { AaveV3Ethereum, AaveV3EthereumLido } from '@bgd-labs/aave-address-book';
import { CustomMarket } from 'src/ui-config/marketsConfig';

const SONIC_DATA_MAP: Map<string, number> = new Map([
  [`${CustomMarket.proto_sonic_v3}-${'0xe18Ab82c81E7Eecff32B8A82B1b7d2d23F1EcE96'}`, 4], // AaveV3Sonic.ASSETS.WETH.A_TOKEN
  [`${CustomMarket.proto_sonic_v3}-${'0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6'}`, 10], // AaveV3Sonic.ASSETS.USDC.e.A_TOKEN
  [`${CustomMarket.proto_sonic_v3}-${`0x6C5E14A212c1C3e4Baf6f871ac9B1a969918c131`}`, 8], // AaveV3Sonic.ASSETS.ws.A_TOKEN
]);

const ETHENA_DATA_MAP: Map<string, number> = new Map([
  [`${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.USDe.A_TOKEN}`, 25],
  [`${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.sUSDe.A_TOKEN}`, 5],
  [`${CustomMarket.proto_lido_v3}-${AaveV3EthereumLido.ASSETS.sUSDe.A_TOKEN}`, 5],
  [`${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.GHO.V_TOKEN}`, 5],
  [`${CustomMarket.proto_lido_v3}-${AaveV3EthereumLido.ASSETS.GHO.V_TOKEN}`, 5],
]);

export type PointsIncentivesTooltipsConfig = {
  ethenaPoints: number | undefined;
  sonicPoints: number | undefined;
};

export const usePointsIncentives = ({
  market,
  rewardedAsset,
}: {
  market: string;
  rewardedAsset?: string;
}) => {
  if (!rewardedAsset) {
    return {
      ethenaPoints: undefined,
      sonicPoints: undefined,
    } as PointsIncentivesTooltipsConfig;
  }

  const ethenaPointsEnabled = true;
  const sonicPointsEnabled = true;

  const key = `${market}-${rewardedAsset}`;

  console.log(key);

  const tooltipsConfig: PointsIncentivesTooltipsConfig = {
    ethenaPoints: ethenaPointsEnabled ? ETHENA_DATA_MAP.get(key) : undefined,
    sonicPoints: sonicPointsEnabled ? SONIC_DATA_MAP.get(key) : undefined,
  };

  console.log(rewardedAsset, tooltipsConfig);

  return tooltipsConfig;
};
