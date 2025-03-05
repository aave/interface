import { AaveV3Base, AaveV3Ethereum, AaveV3EthereumLido } from '@bgd-labs/aave-address-book';
import { CustomMarket } from 'src/ui-config/marketsConfig';

const SUPERFEST_ADDRESSES_SET: Set<string> = new Set([
  `${CustomMarket.proto_base_v3}-${AaveV3Base.ASSETS.WETH.A_TOKEN}`,
  `${CustomMarket.proto_base_v3}-${AaveV3Base.ASSETS.wstETH.A_TOKEN}`,
]);

const SPARK_ADDRESSES_SET: Set<string> = new Set([
  `${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.USDS.A_TOKEN}`,
]);

const KERNEL_ADDRESSES_SET: Set<string> = new Set([
  `${CustomMarket.proto_mainnet_v3}-${AaveV3Ethereum.ASSETS.rsETH.A_TOKEN}`,
  `${CustomMarket.proto_lido_v3}-${AaveV3EthereumLido.ASSETS.rsETH.A_TOKEN}`,
]);

export type ExternalIncentivesTooltipsConfig = {
  superFestRewards: boolean;
  spkAirdrop: boolean;
  kernelPoints: boolean;
};

export const useSimpleExternalIncentives = ({
  market,
  rewardedAsset,
}: {
  market: string;
  rewardedAsset?: string;
}) => {
  if (!rewardedAsset) {
    return {
      superFestRewards: false,
      spkAirdrop: false,
      kernelPoints: false,
    };
  }

  const superFestRewardsEnabled = false;
  const spkRewardsEnabled = true;
  const kernelPointsEnabled = true;

  const key = `${market}-${rewardedAsset}`;

  const tooltipsConfig: ExternalIncentivesTooltipsConfig = {
    superFestRewards: superFestRewardsEnabled && SUPERFEST_ADDRESSES_SET.has(key),
    spkAirdrop: spkRewardsEnabled && SPARK_ADDRESSES_SET.has(key),
    kernelPoints: kernelPointsEnabled && KERNEL_ADDRESSES_SET.has(key),
  };

  return tooltipsConfig;
};
