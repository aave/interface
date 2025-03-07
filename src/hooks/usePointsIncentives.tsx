import {
  AaveV3Arbitrum,
  AaveV3Base,
  AaveV3Ethereum,
  AaveV3EthereumEtherFi,
  AaveV3EthereumLido,
  AaveV3Linea,
  AaveV3Scroll,
  AaveV3Sonic,
  AaveV3ZkSync,
} from '@bgd-labs/aave-address-book';
import { CustomMarket } from 'src/ui-config/marketsConfig';

const SONIC_DATA_MAP: Map<string, number> = new Map([
  [`${CustomMarket.proto_sonic_v3}-${AaveV3Sonic.ASSETS.WETH}`, 4],
  [`${CustomMarket.proto_sonic_v3}-${AaveV3Sonic.ASSETS.USDCe}`, 10],
  [`${CustomMarket.proto_sonic_v3}-${AaveV3Sonic.ASSETS.wS}`, 8],
]);

const ETHENA_DATA_MAP: Map<string, number> = new Map([
  [`${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.USDe.A_TOKEN}`, 25],
  [`${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.sUSDe.A_TOKEN}`, 5],
  [`${CustomMarket.proto_lido_v3}-${AaveV3EthereumLido.ASSETS.sUSDe.A_TOKEN}`, 5],
  [`${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.GHO.V_TOKEN}`, 5],
  [`${CustomMarket.proto_lido_v3}-${AaveV3EthereumLido.ASSETS.GHO.V_TOKEN}`, 5],
]);

const ETHERFI_DATA_MAP: Map<string, number> = new Map([
  [`${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.weETH.A_TOKEN}`, 3],
  [`${CustomMarket.proto_etherfi_v3}-${AaveV3EthereumEtherFi.ASSETS.weETH.A_TOKEN}`, 3],
  // [`${CustomMarket.proto_lido_v3}-${AaveV3EthereumLido.ASSETS.weETH.A_TOKEN}`, 3],
  [`${CustomMarket.proto_arbitrum_v3}-${AaveV3Arbitrum.ASSETS.weETH.A_TOKEN}`, 3],
  [`${CustomMarket.proto_base_v3}-${AaveV3Base.ASSETS.weETH.A_TOKEN}`, 3],
  [`${CustomMarket.proto_scroll_v3}-${AaveV3Scroll.ASSETS.weETH.A_TOKEN}`, 3],
  [`${CustomMarket.proto_zksync_v3}-${AaveV3ZkSync.ASSETS.weETH.A_TOKEN}`, 3],
  [`${CustomMarket.proto_linea_v3}-${AaveV3Linea.ASSETS.weETH.A_TOKEN}`, 3],
]);

export type PointsIncentivesTooltipsConfig = {
  ethenaPoints: number | undefined;
  sonicPoints: number | undefined;
  etherfiPoints: number | undefined;
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
      etherfiPoints: undefined,
    } as PointsIncentivesTooltipsConfig;
  }

  const ethenaPointsEnabled = true;
  const sonicPointsEnabled = true;
  const etherfiPointsEnabled = true;

  const key = `${market}-${rewardedAsset}`;

  const tooltipsConfig: PointsIncentivesTooltipsConfig = {
    ethenaPoints: ethenaPointsEnabled ? ETHENA_DATA_MAP.get(key) : undefined,
    sonicPoints: sonicPointsEnabled ? SONIC_DATA_MAP.get(key) : undefined,
    etherfiPoints: etherfiPointsEnabled ? ETHERFI_DATA_MAP.get(key) : undefined,
  };

  return tooltipsConfig;
};
