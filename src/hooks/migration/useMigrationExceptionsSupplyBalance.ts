import { useQuery } from '@tanstack/react-query';
import { MigrationSupplyException } from 'src/store/v3MigrationSlice';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import invariant from 'tiny-invariant';

export const useMigrationExceptionsSupplyBalance = (
  fromMarketData: MarketDataType,
  toMarketData: MarketDataType,
  supplyExceptions?: MigrationSupplyException[]
) => {
  const { migrationService } = useSharedDependencies();
  return useQuery({
    queryKey: queryKeysFactory.migrationExceptions(
      supplyExceptions || [],
      fromMarketData,
      toMarketData
    ),
    queryFn: () => {
      invariant(supplyExceptions, 'Supply exceptions are required');
      return migrationService.getMigrationExceptionSupplyBalances(
        supplyExceptions,
        fromMarketData,
        toMarketData
      );
    },
    enabled: !!supplyExceptions,
  });
};
