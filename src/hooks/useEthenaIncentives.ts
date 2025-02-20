import { ProtocolAction } from '@aave/contract-helpers';
import { AaveV3Ethereum, AaveV3EthereumLido } from '@bgd-labs/aave-address-book';

const getEthenaData = (action: ProtocolAction, assetAddress: string): number | undefined =>
  ETHENA_DATA_MAP.get(`${action}-${assetAddress}`);

const ETHENA_DATA_MAP: Map<string, number> = new Map([
  [`${ProtocolAction.supply}-${AaveV3Ethereum.ASSETS.USDe.A_TOKEN}`, 25],
  [`${ProtocolAction.supply}-${AaveV3Ethereum.ASSETS.sUSDe.A_TOKEN}`, 5],
  [`${ProtocolAction.supply}-${AaveV3EthereumLido.ASSETS.sUSDe.A_TOKEN}`, 5],
  [`${ProtocolAction.borrow}-${AaveV3Ethereum.ASSETS.GHO.V_TOKEN}`, 5],
  [`${ProtocolAction.borrow}-${AaveV3EthereumLido.ASSETS.GHO.V_TOKEN}`, 5],
]);

export const useEthenaIncentives = (action?: ProtocolAction, rewardedAsset?: string) => {
  if (!action || !rewardedAsset) {
    return undefined;
  }

  const returnedValue = getEthenaData(action, rewardedAsset);

  if (
    action === ProtocolAction.supply &&
    rewardedAsset === AaveV3EthereumLido.ASSETS.sUSDe.A_TOKEN
  ) {
    console.log({ returnedValue, action, rewardedAsset });
  }
  return returnedValue;
};
