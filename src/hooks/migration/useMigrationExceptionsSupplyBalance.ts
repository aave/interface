import { useQuery } from '@tanstack/react-query';
import { MigrationServiceMarketDataType } from 'src/services/MigrationService';
import { MigrationSupplyException } from 'src/store/v3MigrationSlice';
import { queryKeysFactory, QueryMarketDataType } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import invariant from 'tiny-invariant';

export type UseMigrationExceptionsSupplyBalanceMarketDataType = QueryMarketDataType &
  MigrationServiceMarketDataType;

export const useMigrationExceptionsSupplyBalance = (
  fromMarketData: UseMigrationExceptionsSupplyBalanceMarketDataType,
  toMarketData: UseMigrationExceptionsSupplyBalanceMarketDataType,
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
