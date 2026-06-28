import { Pool, V3MigrationHelperService } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import {
  MIGRATION_ASSETS_EXCEPTIONS,
  MigrationException,
  MigrationSupplyException,
} from 'src/store/v3MigrationSlice';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

export class MigrationService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getMigrationService(fromMarketData: MarketDataType, toMarketData: MarketDataType) {
    invariant(
      fromMarketData.addresses.V3_MIGRATOR,
      'V3_MIGRATOR address is not defined in fromMarketData'
    );
    invariant(fromMarketData.chainId === toMarketData.chainId, 'ChainId mismatch');
    const provider = this.getProvider(toMarketData.chainId);
    const toPool = new Pool(provider, {
      POOL: toMarketData.addresses.LENDING_POOL,
      REPAY_WITH_COLLATERAL_ADAPTER: toMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: toMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
      WETH_GATEWAY: toMarketData.addresses.WETH_GATEWAY,
      L2_ENCODER: toMarketData.addresses.L2_ENCODER,
    });
    return new V3MigrationHelperService(provider, fromMarketData.addresses.V3_MIGRATOR, toPool);
  }

  async getMigrationExceptionSupplyBalances(
    migrationSupplyException: MigrationSupplyException[],
    fromMarketData: MarketDataType,
    toMarketData: MarketDataType
  ) {
    const networkConfig = getNetworkConfig(fromMarketData.chainId);
    const chainId = networkConfig.underlyingChainId || fromMarketData.chainId;
    const exceptions = MIGRATION_ASSETS_EXCEPTIONS[chainId] || [];
    const filteredSuppliesForExceptions = migrationSupplyException.filter(
      (supply) =>
        exceptions.indexOf(supply.underlyingAsset) >= 0 && supply.scaledATokenBalance !== '0'
    );
    const migrationExceptions: Record<string, MigrationException> = {};
    if (filteredSuppliesForExceptions.length !== 0) {
      const migrationService = this.getMigrationService(fromMarketData, toMarketData);
      const mappedSupplies = filteredSuppliesForExceptions.map(
        ({ scaledATokenBalance, underlyingAsset }) => {
          return migrationService.getMigrationSupply({
            amount: scaledATokenBalance,
            asset: underlyingAsset,
          });
        }
      );
      const result = await Promise.all(mappedSupplies);
      result.forEach(([asset, amount], index) => {
        const v2UnderlyingAsset = filteredSuppliesForExceptions[index].underlyingAsset;
        migrationExceptions[v2UnderlyingAsset] = {
          v2UnderlyingAsset,
          v3UnderlyingAsset: asset.toLowerCase(),
          amount: amount.toString(),
        };
      });
    }
    return migrationExceptions;
  }
}
