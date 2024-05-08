import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useGovernanceTokens = (blockHash?: string) => {
  const { governanceWalletBalanceService } = useSharedDependencies();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const user = useRootStore((store) => store.account);

  return useQuery({
    queryFn: () =>
      governanceWalletBalanceService.getGovernanceTokensBalance(
        governanceV3Config.coreChainId,
        governanceV3Config.addresses.WALLET_BALANCE_PROVIDER,
        user,
        blockHash
      ),
    queryKey: queryKeysFactory.governanceTokens(user, currentMarketData),
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
    initialData: {
      aave: '0',
      stkAave: '0',
      aAave: '0',
    },
  });
};
