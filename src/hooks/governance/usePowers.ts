import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const usePowers = (blockHash?: string) => {
  const { governanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => governanceService.getPowers(governanceV3Config.coreChainId, user, blockHash),
    queryKey: queryKeysFactory.powers(user, governanceV3Config.coreChainId),
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};
