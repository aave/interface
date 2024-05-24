import {
  MigrationDelegationApproval,
  MigrationSupplyAsset,
} from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useMigrationApprovalTxs = (
  fromMarketData: MarketDataType,
  toMarketData: MarketDataType,
  supplyAssets: MigrationSupplyAsset[],
  creditDelegationApprovals: MigrationDelegationApproval[]
) => {
  const user = useRootStore((store) => store.account);
  const { migrationService } = useSharedDependencies();
  return useQuery({
    queryFn: () =>
      migrationService.getMigrationApprovalTxs(
        fromMarketData,
        toMarketData,
        supplyAssets,
        creditDelegationApprovals,
        user
      ),
    enabled: !!user,
    queryKey: ['migrationApprovalTxs'],
  });
};
